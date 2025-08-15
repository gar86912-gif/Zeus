const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key: { type: String, required: true },
    quota: { type: Number, default: null }, // الحصة المتاحة (اختياري)
    used: { type: Number, default: 0 }, // عدد الاستخدامات الحالية
    active: { type: Boolean, default: true }
});

const aiModelSchema = new mongoose.Schema({
    name: { type: String, required: true }, // مثال: ChatGPT, Gemini
    provider: { type: String, required: true }, // مثال: OpenAI, Google, Anthropic
    role: { type: String, required: true }, // مثال: Backend Developer
    apiKeys: [apiKeySchema], // قائمة المفاتيح لهذا النموذج
    switchMode: { type: String, enum: ['auto', 'round-robin'], default: 'auto' }, // وضع التبديل
    avatarUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIModel', aiModelSchema);
