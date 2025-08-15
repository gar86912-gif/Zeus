const express = require('express');
const router = express.Router();
const { callAIProvider, callMediator } = require('../services/aiProviders');
const { getNextApiKey } = require('../services/aiKeySwitcher');
const Message = require('../models/Message');
const AIModel = require('../models/AIModel');
const auth = require('../middleware/auth');

// جلب جميع النماذج
router.get('/', auth, async (req, res) => {
    const models = await AIModel.find();
    res.json(models);
});

// إضافة نموذج جديد
router.post('/', auth, async (req, res) => {
    const model = new AIModel(req.body);
    await model.save();
    res.status(201).json(model);
});

// إضافة مفتاح جديد لنموذج
router.post('/:id/keys', auth, async (req, res) => {
    const { key, quota } = req.body;
    const model = await AIModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    model.apiKeys.push({ key, quota, used: 0, active: true });
    await model.save();
    res.json(model);
});

// تعديل وضع التبديل
router.patch('/:id/switch-mode', auth, async (req, res) => {
    const { switchMode } = req.body;
    const model = await AIModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    model.switchMode = switchMode;
    await model.save();
    res.json(model);
});

// حذف نموذج
router.delete('/:id', auth, async (req, res) => {
    await AIModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// حذف مفتاح من نموذج
router.delete('/:id/keys/:keyId', auth, async (req, res) => {
    const model = await AIModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    model.apiKeys.id(req.params.keyId).remove();
    await model.save();
    res.json(model);
});

// جلب رد النموذج الذكي
router.post('/:id/reply', async (req, res) => {
    const model = await AIModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    const { text } = req.body;

    // اختيار المفتاح المناسب حسب وضع التبديل
    const apiKeyObj = getNextApiKey(model);
    if (!apiKeyObj) return res.status(400).json({ error: 'لا يوجد مفتاح متاح لهذا النموذج.' });

    try {
        const replyText = await callAIProvider({
            provider: model.provider,
            apiKey: apiKeyObj.key,
            prompt: text,
            role: model.role
        });
        // تحديث عدد الاستخدامات للمفتاح
        apiKeyObj.used = (apiKeyObj.used || 0) + 1;
        await model.save();
        res.json({ text: replyText });
    } catch (err) {
        res.status(500).json({ error: err.message || 'خطأ في استدعاء المزود.' });
    }
});

// endpoint جديد: تنظيم الحوار عبر الوسيط ثم إرسال السياق لكل نموذج
router.post('/multi-reply', async (req, res) => {
    const { roomId, userText } = req.body;
    // جلب كل الرسائل السابقة في الغرفة
    const context = await Message.find({ room: roomId }).sort({ createdAt: 1 });
    // جلب كل النماذج المشاركة في الغرفة
    const models = await AIModel.find({ _id: { $in: req.body.models } });

    // جلب مفتاح الوسيط (Gemini-1.5-fash)
    const mediatorModel = await AIModel.findOne({ provider: 'Google', name: /gemini-1.5-fash/i });
    if (!mediatorModel) return res.status(400).json({ error: 'لم يتم العثور على وسيط تنظيم الحوار.' });
    const mediatorKeyObj = getNextApiKey(mediatorModel);
    if (!mediatorKeyObj) return res.status(400).json({ error: 'لا يوجد مفتاح متاح للوسيط.' });

    // استدعاء الوسيط ليعطي تعليمات لكل نموذج
    const instructionsList = await callMediator({
        apiKey: mediatorKeyObj.key,
        context,
        models
    });

    // لكل نموذج: أرسل له السياق وتعليماته ليبني رده
    const replies = [];
    for (const model of models) {
        const apiKeyObj = getNextApiKey(model);
        if (!apiKeyObj) {
            replies.push({ modelId: model._id, error: 'لا يوجد مفتاح متاح لهذا النموذج.' });
            continue;
        }
        const instructions = instructionsList.find(i => i.modelId.toString() === model._id.toString())?.instructions || '';
        try {
            const replyText = await callAIProvider({
                provider: model.provider,
                apiKey: apiKeyObj.key,
                prompt: `${instructions}\n\nرسالة المستخدم: ${userText}`,
                role: model.role,
                context
            });
            apiKeyObj.used = (apiKeyObj.used || 0) + 1;
            await model.save();
            replies.push({ modelId: model._id, text: replyText });
        } catch (err) {
            replies.push({ modelId: model._id, error: err.message });
        }
    }
    res.json({ replies });
});

module.exports = router;
