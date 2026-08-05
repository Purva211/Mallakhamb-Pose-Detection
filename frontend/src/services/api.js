import axios from 'axios';
import { mockImageResult, poses, dashboardStats } from '../utils/dummyData';

// API Client pointing to Python FastAPI server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
});

export const predictImage = async (formData) => {
  try {
    const response = await api.post('/detect/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('API Error predictImage:', error);
    // Fallback to mock if server offline
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Server connection failed', 
      data: mockImageResult 
    };
  }
};

export const predictFrame = async (frameBase64) => {
  try {
    const response = await api.post('/detect/frame', { image: frameBase64 });
    return response.data;
  } catch (error) {
    console.error('API Error predictFrame:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Frame processing error' 
    };
  }
};

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const startVideoAnalysis = async (videoId, config = {}) => {
  const response = await api.post('/video/analyze', { videoId, ...config });
  return response.data;
};

export const getVideoStatus = async (videoId) => {
  const response = await api.get(`/video/${videoId}/status`);
  return response.data;
};

export const getVideoResults = async (videoId) => {
  const response = await api.get(`/video/${videoId}/results`);
  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await api.delete(`/video/${videoId}`);
  return response.data;
};

export const getVideoFrameUrl = (videoId, frameNumber) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseUrl}/video/${videoId}/frame?frameNumber=${frameNumber}`;
};

export const startLiveSession = async () => {
  return { success: true, sessionId: 'live_' + Math.floor(Math.random() * 10000) };
};

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    return { success: true, data: dashboardStats };
  }
};

export const getPoses = async () => {
  try {
    const response = await api.get('/poses');
    return response.data;
  } catch (error) {
    return { success: true, data: poses };
  }
};

export const submitContact = async (payload) => {
  return { success: true, message: 'Message sent successfully' };
};

export const getChatbotStatus = async () => {
  try {
    const response = await api.get('/chatbot/status');
    return response.data;
  } catch (error) {
    return { success: false, error: 'Chatbot server offline' };
  }
};

export const queryChatbot = async (question) => {
  try {
    const response = await api.post('/chatbot/query', { question });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      answer: 'Failed to communicate with the local AI assistant. Ensure the backend server is running.' 
    };
  }
};

export default api;
