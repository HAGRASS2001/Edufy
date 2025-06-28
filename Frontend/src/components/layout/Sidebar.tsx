import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Dashboard, 
  Quiz,
  Announcement,
  Logout
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { logout } from '../../services/api';
import { useAppSelector } from '../../store/store';

const StyledSidebar = styled(Sidebar)(({ theme }) => ({
  height: '100vh',
  width: '320px',
  '& .ps-sidebar-container': {
    background: 'linear-gradient(180deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    border: 'none',
    boxShadow: '2px 0 15px rgba(0,0,0,0.25)',
    height: '100vh',
    width: '320px',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  '& .ps-menu-button': {
    color: '#ffffff',
    margin: '6px 12px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    fontSize: '15px',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      transform: 'translateX(6px)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      '& span, & .ps-menu-label': {
        color: '#000000',
      },
    },
    '&.ps-active': {
      backgroundColor: 'rgba(239, 68, 68, 0.25)',
      boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
      borderLeft: '4px solid #ef4444',
    },
    '& span, & .ps-menu-label': {
      color: '#ffffff',
    },
  },
  '& .ps-menu-icon': {
    color: '#ffffff',
    marginRight: '14px',
    fontSize: '20px',
  }
}));

const SidebarHeader = styled('div')({
  padding: '28px 20px',
  textAlign: 'center',
  borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
  marginBottom: '20px',
  background: 'rgba(239, 68, 68, 0.05)',
});

const Logo = styled('div')({
  fontSize: '28px',
  fontWeight: '700',
  color: '#ffffff',
  marginBottom: '8px',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
});

const Subtitle = styled('div')({
  fontSize: '13px',
  color: 'rgba(255,255,255,0.8)',
  fontWeight: '400',
  letterSpacing: '0.5px',
});

const UserInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  color: '#ffffff',
  marginBottom: '16px',
  padding: '12px 20px',
  background: 'rgba(239, 68, 68, 0.1)',
  borderRadius: '12px',
  margin: '12px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
});

const UserAvatar = styled('div')({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '14px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ffffff',
  boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)',
});

const LogoutButton = styled('button')({
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  marginTop: '8px',
  '&:hover': {
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
});

function SidebarComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Get user from Redux store
  const reduxUser = useAppSelector(state => state.auth.user);
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      user = {};
    }
  }
  const userName = user.name || user.username || 'User';
  const userMajor = user.major || user.role || user.courses?.[0] || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledSidebar collapsed={collapsed}>
      <SidebarHeader>
        <Logo>🎓 Edufy</Logo>
        <Subtitle>University Quizzes & Announcements</Subtitle>
      </SidebarHeader>
      
      <Menu>
        <MenuItem 
          component={<Link to="/dashboard" />}
          icon={<Dashboard />}
        >
          Dashboard
        </MenuItem>
        
        <MenuItem 
          component={<Link to="/quizzes" />}
          icon={<Quiz />}
        >
          Quizzes
        </MenuItem>

        <MenuItem 
          component={<Link to="/announcements" />}
          icon={<Announcement />}
        >
          Announcements
        </MenuItem>

        
        <div style={{ 
          borderTop: '1px solid rgba(239, 68, 68, 0.3)', 
          marginTop: 'auto',
          paddingTop: '20px',
          background: 'rgba(239, 68, 68, 0.03)',
        }}>
          <UserInfo>
            <UserAvatar>{userName ? userName[0].toUpperCase() : 'U'}</UserAvatar>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{userName}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: '400' }}>{userMajor}</div>
            </div>
          </UserInfo>
          <div style={{ padding: '0 12px' }}>
            <LogoutButton onClick={handleLogout}>
              <Logout style={{ fontSize: '18px' }} />
              Logout
            </LogoutButton>
          </div>
        </div>
      </Menu>
    </StyledSidebar>
  );
}

export default SidebarComponent;
