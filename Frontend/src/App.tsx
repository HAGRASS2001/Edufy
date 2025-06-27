import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import Announcements from './pages/Announcements';
import Login from './pages/Login';
import './styles/App.css';

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ef4444',
    },
    secondary: {
      main: '#1f2937',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {location.pathname !== '/login' && (
          <div className="sidebar">
            <Sidebar />
          </div>
        )}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/announcements" element={<Announcements />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
