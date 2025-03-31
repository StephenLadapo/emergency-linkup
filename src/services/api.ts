
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request/response interceptors for better debugging
api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const registerUser = async (
  email: string, 
  password: string, 
  fullName: string, 
  studentNumber: string
) => {
  try {
    const response = await api.post('/register', {
      email,
      password,
      fullName,
      studentNumber
    });
    return response.data;
  } catch (error: any) {
    console.error('Registration API error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', {
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const sendConfirmationEmail = async (email: string, fullName: string) => {
  try {
    const response = await api.post('/send-confirmation', {
      email,
      fullName
    });
    return response.data.success;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
};

export default api;
