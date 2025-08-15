import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import ParticipantList from '../components/ParticipantList';
import ChatMessage from '../components/ChatMessage';
import { io } from "socket.io-client";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: 0 4px 32px ${({ theme }) => theme.accent}22;
  padding: 32px 24px;
  transition: background 0.3s;
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 10px 4px;
    margin: 10px auto;
    border-radius: 10px;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 18px;
  font-weight: bold;
`;

const ChatBox = styled.div`
  border: 1.5px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 16px;
  min-height: 220px;
  background: ${({ theme }) => theme.background};
  margin-top: 18px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px ${({ theme }) => theme.accent}11;
  transition: background 0.3s;
  @media (max-width: 600px) {
    padding: 8px;
    min-height: 120px;
    font-size: 0.95rem;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
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
  @media (max-width: 600px) {
    font-size: 0.95rem;
    padding: 8px;
  }
`;

const SendBtn = styled.button`
  min-width: 90px;
  @media (max-width: 600px) {
    min-width: 60px;
    font-size: 0.95rem;
    padding: 8px 0;
  }
`;

export default function Room({ showNotification }) {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetch(`/api/rooms/${id}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setRoom(data))
      .catch(() => showNotification('error', 'تعذر جلب بيانات الغرفة.'));
    fetch(`/api/rooms/${id}/messages`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => {
        showNotification('error', 'تعذر جلب الرسائل.');
        setLoading(false);
      });

    socketRef.current = io('/', { transports: ['websocket'] });
    socketRef.current.emit('joinRoom', id);

    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userMsg = {
      sender: localStorage.getItem('username'),
      senderModel: 'User',
      text: input
    };
    // حفظ رسالة المستخدم في قاعدة البيانات
    await fetch(`/api/rooms/${id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(userMsg)
    });
    setMessages([...messages, userMsg]);
    setInput('');

    // جلب النماذج المشاركة في الغرفة
    const aiModelIds = room.participants.filter(p => p.provider).map(p => p._id);

    // استدعاء الوسيط ثم جلب ردود النماذج
    const res = await fetch('/api/ai-models/multi-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        roomId: id,
        userText: userMsg.text,
        models: aiModelIds
      })
    });
    const data = await res.json();
    if (data.replies) {
      data.replies.forEach(reply => {
        if (reply.text) {
          setMessages(msgs => [...msgs, {
            sender: room.participants.find(p => p._id === reply.modelId)?.name || 'نموذج',
            senderModel: room.participants.find(p => p._id === reply.modelId)?.role || 'AI',
            text: reply.text
          }]);
        } else if (reply.error) {
          showNotification('error', `خطأ في رد النموذج: ${reply.error}`);
        }
      });
    } else {
      showNotification('error', 'تعذر جلب ردود النماذج.');
    }
  };

  if (loading || !room) return <div>جاري التحميل...</div>;

  // المشاركين: جلبهم من room.participants
  const participants = room.participants.map(p => ({
    name: p.name || p.username,
    role: p.role || 'User',
    provider: p.provider || '',
    avatarUrl: p.avatarUrl || ''
  }));

  return (
    <Wrapper>
      <Title>{room.title}</Title>
      <ParticipantList participants={participants} />
      <ChatBox>
        {messages.map(msg => (
          <ChatMessage key={msg._id} sender={msg.sender} role={msg.senderModel} text={msg.text} />
        ))}
      </ChatBox>
      <Form onSubmit={handleSend}>
        <Input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          required
        />
        <SendBtn type="submit">إرسال</SendBtn>
      </Form>
    </Wrapper>
  );
}
