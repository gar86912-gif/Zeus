import React from 'react';
import styled from 'styled-components';

const Message = styled.div`
  margin-bottom: 12px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.accent}11;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 600px) {
    padding: 7px 8px;
    font-size: 0.95rem;
  }
`;

const Sender = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const Role = styled.span`
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
  font-size: 0.95em;
`;

export default function ChatMessage({ sender, role, text, showNotification }) {
  if (!sender || !text) {
    showNotification && showNotification('error', 'تعذر عرض الرسالة بسبب نقص البيانات.');
    return <div style={{ color: '#e74c3c', marginBottom: 10 }}>تعذر عرض الرسالة.</div>;
  }

  return (
    <Message>
      <Sender>{sender}</Sender>
      <Role>({role})</Role>
      <span>: {text}</span>
    </Message>
  );
}
