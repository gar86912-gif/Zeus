// خدمة اختيار مفتاح API المناسب حسب وضع التبديل

function getNextApiKey(aiModel) {
    const keys = aiModel.apiKeys.filter(k => k.active);
    if (!keys.length) return null;

    if (aiModel.switchMode === 'auto') {
        // تلقائي: استخدم أول مفتاح متاح لم تنتهي حصته
        for (let key of keys) {
            if (key.quota == null || key.used < key.quota) {
                return key;
            }
        }
        return null; // لا يوجد مفتاح متاح
    } else if (aiModel.switchMode === 'round-robin') {
        // دائري: وزع الحمل بالتناوب
        if (!aiModel._lastKeyIndex) aiModel._lastKeyIndex = 0;
        aiModel._lastKeyIndex = (aiModel._lastKeyIndex + 1) % keys.length;
        return keys[aiModel._lastKeyIndex];
    }
    // افتراضي: أول مفتاح
    return keys[0];
}

module.exports = { getNextApiKey };
