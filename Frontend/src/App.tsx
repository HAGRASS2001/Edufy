import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, useMediaQuery, Drawer, IconButton } from '@mui/material';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import Announcements from './pages/Announcements';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './styles/App.css';
import MenuIcon from '@mui/icons-material/Menu';

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
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          className="app-container"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: '100vh',
            width: '100vw',
            overflowX: 'hidden',
          }}
        >
          {/* Hamburger menu for mobile */}
          {!isDesktop && location.pathname !== '/login' && location.pathname !== '/signup' && (
            <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1301 }}>
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ background: '#fff', boxShadow: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
          {/* Sidebar for desktop */}
          {location.pathname !== '/login' && location.pathname !== '/signup' && isDesktop && (
            <Box
              className="sidebar"
              sx={{
                width: 320,
                minWidth: 320,
                maxWidth: 320,
                flexShrink: 0,
                zIndex: 10,
                minHeight: '100vh',
              }}
            >
              <Sidebar />
            </Box>
          )}
          {/* Drawer for mobile */}
          {!isDesktop && location.pathname !== '/login' && location.pathname !== '/signup' && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 260,
                  boxSizing: 'border-box',
                  background: 'linear-gradient(180deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
                },
              }}
            >
              <Sidebar />
            </Drawer>
          )}
          <Box
            className="main-content"
            sx={{
              flex: 1,
              width: '100%',
              minHeight: '100vh',
              p: { xs: 1, sm: 2, md: 3 },
              background: theme.palette.background.default,
              overflowX: 'auto',
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/announcements" element={<Announcements />} />
            </Routes>
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
