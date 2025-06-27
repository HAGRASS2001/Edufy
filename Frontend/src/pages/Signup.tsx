import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, MenuItem, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { signupApi } from '../services/api';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    semester: '',
    role: 'student',
    studentId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signupApi({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        semester: form.semester,
        role: form.role,
        studentId: form.studentId,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

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
            {/* Book icon SVG as logo */}
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
          {success && <Alert severity="success" sx={{ mb: 2 }}>Signup successful! Redirecting to login...</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              variant="standard"
              fullWidth
              value={form.name}
              onChange={handleChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Username"
              name="username"
              variant="standard"
              fullWidth
              value={form.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              variant="standard"
              fullWidth
              value={form.email}
              onChange={handleChange}
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
              label="Semester"
              name="semester"
              variant="standard"
              fullWidth
              value={form.semester}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Student ID"
              name="studentId"
              variant="standard"
              fullWidth
              value={form.studentId}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Role"
              name="role"
              variant="standard"
              fullWidth
              value={form.role}
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              {roles.map(r => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Password"
              name="password"
              variant="standard"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
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
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              variant="standard"
              fullWidth
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(s => !s)} edge="end" tabIndex={-1}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
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
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Button variant="text" sx={{ color: '#2563eb', fontWeight: 600, textTransform: 'none', p: 0, minWidth: 0 }} onClick={() => navigate('/login')}>
                  Log in
                </Button>
              </Typography>
            </Box>
          </form>
        </Box>
      </Paper>
    </div>
  );
};

export default Signup; 