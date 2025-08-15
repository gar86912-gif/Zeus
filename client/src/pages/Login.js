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
  transition: background 0.3s;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 18px;
  font-weight: bold;
  letter-spacing: 1px;
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
  transition: border 0.3s;
  &:focus {
    border-color: ${({ theme }) => theme.accent};
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 10px;
`;

export default function Login({ showNotification }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        showNotification('success', 'تم تسجيل الدخول بنجاح!');
        navigate('/dashboard');
      } else {
        let msg = 'حدث خطأ غير متوقع.';
        if (data.error === 'اسم المستخدم غير صحيح') msg = 'اسم المستخدم غير صحيح، يرجى التأكد.';
        else if (data.error === 'كلمة المرور غير صحيحة') msg = 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.';
        showNotification('error', msg);
        setError(msg);
      }
    } catch (err) {
      showNotification('error', 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.');
      setError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <Card>
      <Title>تسجيل الدخول إلى ChatZEUS</Title>
      <form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={e => setUsername(e.target.value)}
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
        <Button type="submit">دخول</Button>
      </form>
    </Card>
  );
}
