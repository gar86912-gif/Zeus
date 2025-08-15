import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Notification from './components/Notification';

// تعريف الثيمات
const lightTheme = {
  background: '#f6f8fa',
  card: '#fff',
  text: '#222',
  accent: '#0077ff',
  border: '#e3e3e3',
  button: '#0077ff',
  buttonText: '#fff',
};
const darkTheme = {
  background: '#181a1b',
  card: '#23272f',
  text: '#f6f8fa',
  accent: '#ffb300',
  border: '#333',
  button: '#ffb300',
  buttonText: '#222',
};

// ستايل عام
const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
    transition: background 0.3s, color 0.3s;
    margin: 0;
    padding: 0;
  }
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  * {
    box-sizing: border-box;
  }
  a {
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
  }
  button {
    background: ${({ theme }) => theme.button};
    color: ${({ theme }) => theme.buttonText};
    border: none;
    border-radius: 8px;
    padding: 8px 18px;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    transition: background 0.3s, color 0.3s;
  }
  button:hover {
    filter: brightness(0.95);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  }
  @media (max-width: 600px) {
    body {
      font-size: 1rem;
    }
    #root {
      padding: 0;
    }
  }
`;

// زر تبديل الوضع
const ThemeToggle = styled.button`
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 100;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.accent};
  border: 2px solid ${({ theme }) => theme.accent};
  padding: 6px 14px;
  font-size: 1.1rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
`;

function App() {
  const [theme, setTheme] = useState('light');
  const themeObj = theme === 'light' ? lightTheme : darkTheme;
  const [notification, setNotification] = useState(null);

  function RequireAuth({ children }) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return null;
    }
    return children;
  }

  // دالة لإظهار الإشعار
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // تمرير showNotification لجميع الصفحات عبر props
  return (
    <ThemeProvider theme={themeObj}>
      <GlobalStyle />
      {notification && <Notification type={notification.type} message={notification.message} />}
      <Router>
        <ThemeToggle onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 وضع ليلي' : '☀️ وضع نهاري'}
        </ThemeToggle>
        <Routes>
          <Route path="/" element={<Home showNotification={showNotification} />} />
          <Route path="/login" element={<Login showNotification={showNotification} />} />
          <Route path="/register" element={<Register showNotification={showNotification} />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard showNotification={showNotification} />
            </RequireAuth>
          } />
          <Route path="/room/:id" element={
            <RequireAuth>
              <Room showNotification={showNotification} />
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth>
              <Settings showNotification={showNotification} />
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;