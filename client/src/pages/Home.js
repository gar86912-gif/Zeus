import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

// مؤثر نبض للشعار
const pulse = keyframes`
  0% { transform: scale(1); filter: drop-shadow(0 0 0 #0077ff); }
  50% { transform: scale(1.07); filter: drop-shadow(0 0 16px #0077ff88); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0 #0077ff); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.background} 60%, ${theme.card} 100%)`};
  transition: background 0.3s;
  padding: 0 12px;
`;

const Logo = styled.div`
  font-size: 3.2rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.accent};
  animation: ${pulse} 2.2s infinite;
  margin-bottom: 18px;
  user-select: none;
  text-shadow: 0 2px 24px ${({ theme }) => theme.accent}55;

  @media (max-width: 600px) {
    font-size: 2.1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 32px;
  text-align: center;
  max-width: 420px;
  opacity: 0.92;

  @media (max-width: 600px) {
    font-size: 1rem;
    max-width: 95vw;
  }
`;

const StyledButton = styled(Link)`
  background: ${({ theme }) => theme.button};
  color: ${({ theme }) => theme.buttonText};
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 1.15rem;
  font-weight: 500;
  box-shadow: 0 4px 24px ${({ theme }) => theme.accent}22;
  transition: background 0.3s, color 0.3s, transform 0.2s;
  border: none;
  outline: none;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px ${({ theme }) => theme.accent}33;
  }

  @media (max-width: 600px) {
    padding: 10px 18px;
    font-size: 1rem;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 18px;
  left: 0;
  right: 0;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  opacity: 0.7;

  @media (max-width: 600px) {
    font-size: 0.85rem;
    bottom: 8px;
  }
`;

export default function Home({ showNotification }) {
  // مثال: استخدام showNotification عند حدوث خطأ مستقبلاً
  // useEffect(() => {
  //   fetch('/api/some-endpoint')
  //     .catch(() => showNotification('error', 'تعذر تحميل البيانات من الخادم.'));
  // }, []);

  return (
    <Wrapper>
      <Logo>ChatZEUS ⚡</Logo>
      <Subtitle>
        منصة نقاش جماعي حديثة تجمعك مع نماذج الذكاء الاصطناعي حول مشاريعك البرمجية.<br />
        حرية، سرعة، إبداع، وكل شيء في مكان واحد!
      </Subtitle>
      <StyledButton to="/login">ابدأ الآن</StyledButton>
      <Footer>
        &copy; {new Date().getFullYear()} شات زيوس | ChatZEUS
      </Footer>
    </Wrapper>
  );
}
