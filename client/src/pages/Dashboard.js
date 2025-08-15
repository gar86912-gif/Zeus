import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  max-width: 700px;
  margin: 50px auto;
  padding: 0 10px;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  margin-bottom: 24px;
  font-weight: bold;
`;

const RoomList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 22px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RoomCard = styled(Link)`
  background: ${({ theme }) => theme.card};
  border-radius: 14px;
  box-shadow: 0 2px 16px ${({ theme }) => theme.accent}11;
  padding: 22px 18px;
  color: ${({ theme }) => theme.text};
  font-size: 1.08rem;
  font-weight: 500;
  text-decoration: none;
  border: 2px solid transparent;
  transition: box-shadow 0.3s, border 0.3s, transform 0.2s;
  &:hover {
    border: 2px solid ${({ theme }) => theme.accent};
    box-shadow: 0 6px 32px ${({ theme }) => theme.accent}22;
    transform: scale(1.03);
  }
  @media (max-width: 600px) {
    padding: 14px 10px;
    font-size: 1rem;
  }
`;

const NewRoomForm = styled.div`
  margin-top: 28px;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.accent}11;
  @media (max-width: 600px) {
    padding: 10px;
  }
`;

const NewRoomBtn = styled.button`
  margin-top: 10px;
  width: 100%;
`;

export default function Dashboard({ showNotification }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [aiModels, setAiModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    fetch('/api/rooms', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(() => {
        showNotification('error', 'تعذر جلب غرف النقاش من الخادم.');
        setLoading(false);
      });
    fetch('/api/ai-models', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setAiModels(data))
      .catch(() => showNotification('error', 'تعذر جلب النماذج الذكية.'));
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) {
      showNotification('error', 'يرجى إدخال عنوان الغرفة.');
      return;
    }
    if (selectedModels.length === 0) {
      showNotification('error', 'يرجى اختيار نماذج الذكاء الاصطناعي المشاركة.');
      return;
    }
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          title: newRoomTitle,
          createdBy: localStorage.getItem('username'),
          participants: selectedModels,
          participantsModel: Array(selectedModels.length).fill('AIModel')
        })
      });
      if (res.ok) {
        const room = await res.json();
        setRooms([...rooms, room]);
        setNewRoomTitle('');
        setSelectedModels([]);
        showNotification('success', 'تم إنشاء الغرفة بنجاح!');
      } else {
        showNotification('error', 'تعذر إنشاء الغرفة، يرجى المحاولة لاحقاً.');
      }
    } catch {
      showNotification('error', 'تعذر الاتصال بالخادم.');
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <Wrapper>
      <Title>غرف النقاش في ChatZEUS</Title>
      <RoomList>
        {rooms.map(room => (
          <RoomCard key={room._id} to={`/room/${room._id}`}>
            {room.title}
          </RoomCard>
        ))}
      </RoomList>
      <NewRoomForm>
        <h4>إنشاء غرفة جديدة</h4>
        <input
          type="text"
          placeholder="عنوان الغرفة"
          value={newRoomTitle}
          onChange={e => setNewRoomTitle(e.target.value)}
        />
        <div style={{ margin: '10px 0' }}>
          <span>اختر النماذج الذكية المشاركة:</span>
          <div>
            {aiModels.map(model => (
              <label key={model._id} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model._id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedModels([...selectedModels, model._id]);
                    } else {
                      setSelectedModels(selectedModels.filter(id => id !== model._id));
                    }
                  }}
                />
                {model.name} ({model.role}) [{model.provider}]
              </label>
            ))}
          </div>
        </div>
        <NewRoomBtn onClick={handleCreateRoom}>إنشاء غرفة جديدة</NewRoomBtn>
      </NewRoomForm>
    </Wrapper>
  );
}
