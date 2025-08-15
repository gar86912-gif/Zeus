import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: 0 4px 32px ${({ theme }) => theme.accent}22;
  padding: 36px 32px;
  max-width: 340px;
  margin: 80px auto;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 18px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 90%;
  padding: 10px;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1.5px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  &:focus {
    border-color: ${({ theme }) => theme.accent};
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 10px;
`;

export default function Register({ showNotification }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        showNotification('success', 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
        navigate('/login');
      } else {
        const data = await res.json();
        let msg = 'حدث خطأ أثناء إنشاء الحساب.';
        if (data.error?.includes('duplicate')) msg = 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل.';
        showNotification('error', msg);
        setError(msg);
      }
    } catch {
      showNotification('error', 'تعذر الاتصال بالخادم.');
      setError('تعذر الاتصال بالخادم.');
    }
  };

  return (
    <Card>
      <Title>تسجيل حساب جديد</Title>
      <form onSubmit={handleRegister}>
        <Input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <Button type="submit">تسجيل</Button>
      </form>
    </Card>
  );
}
