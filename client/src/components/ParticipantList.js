import React from 'react';
import styled from 'styled-components';

const List = styled.div`
  display: flex;
  gap: 28px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 12px;
    justify-content: flex-start;
  }
`;

const Item = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 8px 14px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.accent}11;
  min-width: 90px;

  @media (max-width: 600px) {
    min-width: 70px;
    padding: 6px 4px;
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-bottom: 4px;
  border: 2px solid ${({ theme }) => theme.accent};

  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
  }
`;

const Name = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const Role = styled.small`
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const Provider = styled.div`
  font-size: 0.9em;
  color: ${({ theme }) => theme.accent};
  opacity: 0.7;
`;

export default function ParticipantList({ participants, showNotification }) {
  if (!participants || participants.length === 0) {
    showNotification && showNotification('error', 'لا يوجد مشاركين في هذه الغرفة.');
    return <div style={{ color: '#e74c3c', marginBottom: 10 }}>لا يوجد مشاركين في هذه الغرفة.</div>;
  }

  return (
    <List>
      {participants.map((p, idx) => (
        <Item key={idx}>
          <Avatar
            src={p.avatarUrl || 'https://ui-avatars.com/api/?name=' + p.name}
            alt={p.name}
          />
          <Name>{p.name}</Name>
          <Role>{p.role}</Role>
          {p.provider && <Provider>{p.provider}</Provider>}
        </Item>
      ))}
    </List>
  );
}
