import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
   
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


export const loginApi = async (username: string, password: string) => {
  const response = await api.post('/users/login', { username, password });
  return response.data;
};


export const signupApi = async (userData: {
  name: string;
  username: string;
  email: string;
  password: string;
  semester: string;
  role: string;
  studentId: string;
}) => {
  const response = await api.post('/users', userData);
  return response.data;
};


export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
}; 