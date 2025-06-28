import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { loginApi } from '../services/api';
import { useAppDispatch } from '../store/store';
import { setUser, setToken } from '../store/authSlice';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(username, password);
      dispatch(setUser(data.user));
      dispatch(setToken(data.accessToken));
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg login-bg-light">
      <Paper elevation={10} className="university-login-card two-col-card">
        <Box className="login-illustration">
          
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="90" cy="90" rx="90" ry="90" fill="#e3f0fa" />
            <rect x="40" y="70" width="100" height="60" rx="8" fill="#bcdffb" />
            <rect x="55" y="85" width="70" height="30" rx="4" fill="#fff" />
            <rect x="80" y="120" width="20" height="8" rx="2" fill="#2563eb" />
            <circle cx="60" cy="110" r="5" fill="#2563eb" />
            <circle cx="120" cy="110" r="5" fill="#2563eb" />
            <rect x="90" y="50" width="40" height="8" rx="2" fill="#2563eb" transform="rotate(20 90 50)" />
            <rect x="50" y="40" width="60" height="8" rx="2" fill="#2563eb" transform="rotate(-15 50 40)" />
          </svg>
        </Box>
        <Box className="login-form-col">
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
           
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
              <rect x="6" y="12" width="42" height="30" rx="6" fill="#2563eb"/>
              <rect x="12" y="18" width="30" height="18" rx="3" fill="#fff"/>
              <rect x="18" y="24" width="18" height="6" rx="1.5" fill="#2563eb"/>
            </svg>
            <Typography variant="h6" fontWeight={700} color="#1f2937">
              Edufy
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} color="#2563eb" mb={2}>
              STUDENT PANEL
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="standard"
              fullWidth
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              variant="standard"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(s => !s)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
              <FormControlLabel
                control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ color: '#2563eb' }} />}
                label={<Typography fontSize={14}>Remember me</Typography>}
                sx={{ ml: -1 }}
              />
              <Button href="#" variant="text" sx={{ color: '#2563eb', fontWeight: 500, fontSize: 14, textTransform: 'none' }}>
                Forgot Password?
              </Button>
            </Box>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 1.5,
                fontWeight: 700,
                letterSpacing: 1,
                py: 1.2,
                mt: 1,
                background: '#2563eb',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(37,99,235,0.10)',
                '&:hover': {
                  background: '#1746a0',
                  transform: 'translateY(-2px) scale(1.03)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.18)',
                },
              }}
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </Button>
          </form>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mt: 2, fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
            fullWidth
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const data = await loginApi('IUA', 'IUA');
                dispatch(setUser(data.user));
                dispatch(setToken(data.accessToken));
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
              } catch (err: any) {
                setError(err.response?.data?.message || 'Bypass login failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            Bypass Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 1, fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
            fullWidth
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const data = await loginApi('student', 'student');
                dispatch(setUser(data.user));
                dispatch(setToken(data.accessToken));
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
              } catch (err: any) {
                setError(err.response?.data?.message || 'Student login failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            Student Login
          </Button>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Don&apos;t have an account?{' '}
              <Button variant="text" sx={{ color: '#2563eb', fontWeight: 600, textTransform: 'none', p: 0, minWidth: 0 }} onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default Login; 