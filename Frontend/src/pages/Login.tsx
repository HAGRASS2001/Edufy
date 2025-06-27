import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import '../styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <div className="login-bg login-bg-light">
      <Paper elevation={10} className="university-login-card two-col-card">
        <Box className="login-illustration">
          {/* Placeholder SVG illustration */}
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
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="university logo" style={{ width: 54, height: 54, marginBottom: 8 }} />
            <Typography variant="h6" fontWeight={700} color="#1f2937">
              UNIVERSITY NAME
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} color="#2563eb" mb={2}>
              STUDENT PANEL
            </Typography>
          </Box>
          <Box component="form" sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }} autoComplete="off">
            <TextField
              label="Enrollment number"
              variant="standard"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
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
            >
              Sign in
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default Login; 