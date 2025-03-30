
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    throw new Error(error.response?.data?.message || 'Registration failed');
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
    throw new Error(error.response?.data?.message || 'Login failed');
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
