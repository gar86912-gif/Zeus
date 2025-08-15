import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px);}
  to { opacity: 1; transform: translateY(0);}
`;

const NotificationBox = styled.div`
  position: fixed;
  top: 30px;
  right: 30px;
  min-width: 260px;
  padding: 16px 24px;
  border-radius: 12px;
  background: ${({ type, theme }) => type === 'error' ? '#e74c3c' : theme.accent};
  color: #fff;
  font-size: 1.08rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  z-index: 9999;
  animation: ${fadeIn} 0.4s;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.span`
  font-size: 1.4em;
`;

export default function Notification({ type, message }) {
  return (
    <NotificationBox type={type}>
      <Icon>{type === 'error' ? '❌' : '✅'}</Icon>
      {message}
    </NotificationBox>
  );
}
