const fetch = require('node-fetch');

// استدعاء OpenAI (ChatGPT)
async function callOpenAI({ apiKey, prompt, role }) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: `أنت ${role} في فريق برمجي.` },
            { role: 'user', content: prompt }
        ]
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
    }
    throw new Error(data.error?.message || 'خطأ في استدعاء OpenAI');
}

// استدعاء Google Gemini (مثال وهمي، يجب استبداله بـ API الحقيقي)
async function callGemini({ apiKey, prompt, role, context }) {
    // هنا تضع استدعاء Gemini API الحقيقي
    // سنعيد رد وهمي للتجربة فقط
    return `رد من Gemini (${role}): ${prompt}\n\nسياق النقاش:\n${context.map(m => `${m.sender}: ${m.text}`).join('\n')}`;
}

// وسيط تنظيم الحوار (Gemini-1.5-fash)
async function callMediator({ apiKey, context, models }) {
    // هنا تضع استدعاء Gemini-1.5-fash الحقيقي
    // سنعيد توجيه وهمي: يعطي لكل نموذج دور وتعليمات بناءً على السياق
    return models.map(model => ({
        modelId: model._id,
        instructions: `دورك هو ${model.role}. اقرأ النقاش السابق ورد بناءً عليه.`
    }));
}

async function callAIProvider({ provider, apiKey, prompt, role, context }) {
    if (provider === 'OpenAI') return await callOpenAI({ apiKey, prompt, role, context });
    if (provider === 'Google') return await callGemini({ apiKey, prompt, role, context });
    throw new Error('مزود غير مدعوم حالياً');
}

module.exports = { callAIProvider, callMediator };
