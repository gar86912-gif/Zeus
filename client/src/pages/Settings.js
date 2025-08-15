import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 700px;
  margin: 40px auto;
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: 0 4px 32px ${({ theme }) => theme.accent}22;
  padding: 32px 24px;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 18px;
  font-weight: bold;
`;

const ModelCard = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.accent}11;
`;

const KeyList = styled.ul`
  margin-top: 8px;
`;

const KeyItem = styled.li`
  margin-bottom: 6px;
`;

const SwitchSelect = styled.select`
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
`;

export default function Settings({ showNotification }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModel, setNewModel] = useState({
    name: '',
    provider: '',
    role: '',
    switchMode: 'auto',
    avatarUrl: ''
  });
  const [newKey, setNewKey] = useState({
    key: '',
    quota: '',
    modelIdx: 0
  });

  // جلب النماذج من الـ backend
  useEffect(() => {
    fetch('/api/ai-models')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      });
  }, []);

  // إضافة نموذج جديد
  const handleAddModel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ ...newModel, apiKeys: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setModels([...models, data]);
        setNewModel({
          name: '',
          provider: '',
          role: '',
          switchMode: 'auto',
          avatarUrl: ''
        });
        showNotification('success', 'تم إضافة النموذج بنجاح!');
      } else {
        showNotification('error', 'تعذر إضافة النموذج.');
      }
    } catch {
      showNotification('error', 'تعذر الاتصال بالخادم.');
    }
  };

  // إضافة مفتاح جديد لنموذج محدد
  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      const modelId = models[newKey.modelIdx]._id;
      const res = await fetch(`/api/ai-models/${modelId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({
          key: newKey.key,
          quota: newKey.quota ? Number(newKey.quota) : null
        })
      });
      if (res.ok) {
        const updatedModel = await res.json();
        const updatedModels = [...models];
        updatedModels[newKey.modelIdx] = updatedModel;
        setModels(updatedModels);
        setNewKey({ key: '', quota: '', modelIdx: 0 });
        showNotification('success', 'تم إضافة المفتاح بنجاح!');
      } else {
        showNotification('error', 'تعذر إضافة المفتاح.');
      }
    } catch {
      showNotification('error', 'تعذر الاتصال بالخادم.');
    }
  };

  // تغيير وضع التبديل
  const handleSwitchMode = async (idx, mode) => {
    const modelId = models[idx]._id;
    const res = await fetch(`/api/ai-models/${modelId}/switch-mode`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ switchMode: mode })
    });
    const updatedModel = await res.json();
    const updatedModels = [...models];
    updatedModels[idx] = updatedModel;
    setModels(updatedModels);
  };

  // حذف نموذج
  const handleDeleteModel = async (idx) => {
    const modelId = models[idx]._id;
    await fetch(`/api/ai-models/${modelId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    setModels(models.filter((_, i) => i !== idx));
    showNotification('success', 'تم حذف النموذج بنجاح!');
  };

  // حذف مفتاح من نموذج
  const handleDeleteKey = async (modelIdx, keyIdx) => {
    const modelId = models[modelIdx]._id;
    const keyId = models[modelIdx].apiKeys[keyIdx]._id;
    await fetch(`/api/ai-models/${modelId}/keys/${keyId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    });
    const updated = [...models];
    updated[modelIdx].apiKeys.splice(keyIdx, 1);
    setModels(updated);
    showNotification('success', 'تم حذف المفتاح بنجاح!');
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <Wrapper>
      <Title>إدارة نماذج الذكاء الاصطناعي والمفاتيح</Title>
      {/* إضافة نموذج جديد */}
      <form onSubmit={handleAddModel} style={{ marginBottom: 28 }}>
        <h4>إضافة نموذج جديد</h4>
        <input
          type="text"
          placeholder="اسم النموذج"
          value={newModel.name}
          onChange={e => setNewModel({ ...newModel, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="مزود الخدمة"
          value={newModel.provider}
          onChange={e => setNewModel({ ...newModel, provider: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="الدور"
          value={newModel.role}
          onChange={e => setNewModel({ ...newModel, role: e.target.value })}
          required
        />
        <select
          value={newModel.switchMode}
          onChange={e => setNewModel({ ...newModel, switchMode: e.target.value })}
        >
          <option value="auto">تلقائي عند انتهاء الحصة</option>
          <option value="round-robin">توزيع الحمل (دائري)</option>
        </select>
        <input
          type="text"
          placeholder="رابط الصورة الرمزية (اختياري)"
          value={newModel.avatarUrl}
          onChange={e => setNewModel({ ...newModel, avatarUrl: e.target.value })}
        />
        <button type="submit">إضافة النموذج</button>
      </form>
      {/* عرض النماذج والمفاتيح */}
      {models.map((model, idx) => (
        <ModelCard key={idx}>
          <div>
            <strong>{model.name}</strong> ({model.provider}) - <span>{model.role}</span>
            <button style={{ float: 'left', background: '#e74c3c', color: '#fff', borderRadius: 6, padding: '2px 8px', marginLeft: 8 }}
              onClick={() => handleDeleteModel(idx)}>حذف النموذج</button>
          </div>
          <div>
            وضع التبديل:
            <SwitchSelect
              value={model.switchMode}
              onChange={e => handleSwitchMode(idx, e.target.value)}
            >
              <option value="auto">تلقائي عند انتهاء الحصة</option>
              <option value="round-robin">توزيع الحمل (دائري)</option>
            </SwitchSelect>
          </div>
          <KeyList>
            {model.apiKeys.map((key, kidx) => (
              <KeyItem key={kidx}>
                مفتاح: <code>{key.key}</code> | الحصة: {key.quota ?? 'غير محددة'} | مستخدم: {key.used} | {key.active ? 'فعال' : 'غير فعال'}
                <button style={{ background: '#e74c3c', color: '#fff', borderRadius: 6, padding: '2px 8px', marginLeft: 8 }}
                  onClick={() => handleDeleteKey(idx, kidx)}>حذف المفتاح</button>
              </KeyItem>
            ))}
          </KeyList>
          {/* إضافة مفتاح جديد لهذا النموذج */}
          <form onSubmit={handleAddKey} style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="مفتاح جديد"
              value={newKey.key}
              onChange={e => setNewKey({ ...newKey, key: e.target.value, modelIdx: idx })}
              required
            />
            <input
              type="number"
              placeholder="الحصة (اختياري)"
              value={newKey.modelIdx === idx ? newKey.quota : ''}
              onChange={e => setNewKey({ ...newKey, quota: e.target.value, modelIdx: idx })}
            />
            <button type="submit">إضافة المفتاح</button>
          </form>
        </ModelCard>
      ))}
    </Wrapper>
  );
}
