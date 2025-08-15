require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    // حذف النماذج القديمة (اختياري)
    await AIModel.deleteMany({});
    // إضافة نماذج افتراضية
    await AIModel.create([
        {
            name: 'ChatGPT',
            provider: 'OpenAI',
            role: 'Backend Developer',
            apiKeys: [
                { key: 'sk-openai-demo1', quota: 1000, used: 0, active: true },
                { key: 'sk-openai-demo2', quota: 500, used: 0, active: true }
            ],
            switchMode: 'auto',
            avatarUrl: 'https://ui-avatars.com/api/?name=ChatGPT'
        },
        {
            name: 'Gemini',
            provider: 'Google',
            role: 'UX Designer',
            apiKeys: [
                { key: 'gm-gemini-demo1', quota: null, used: 0, active: true }
            ],
            switchMode: 'round-robin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Gemini'
        }
    ]);
    console.log('✅ تم إضافة النماذج الافتراضية');
    process.exit();
}).catch(err => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
    process.exit(1);
});
