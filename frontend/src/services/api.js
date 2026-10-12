import axios from 'axios';
import { auth, isFirebaseConfigured } from './firebase';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl
  : `https://${configuredApiUrl}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (isFirebaseConfigured && auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else if (import.meta.env.DEV) {
    try {
      const demoUser = JSON.parse(localStorage.getItem('smart_village_user') || 'null');
      if (demoUser?.role) config.headers['X-Demo-Role'] = demoUser.role;
    } catch {
      // Ignore malformed local demo state; the API will reject the request.
    }
  }
  return config;
});

export const apiService = {
  // Authentication and profile
  createProfile: (data) => api.post('/api/auth/profile', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.patch('/api/auth/profile', data),
  getUsers: () => api.get('/api/auth/users'),

  // Health
  getHealth: () => api.get('/health'),

  // Villages
  getVillages: () => api.get('/api/villages'),
  getVillage: (id) => api.get(`/api/villages/${id}`),

  // Farms
  getFarms: (params) => api.get('/api/farms', { params }),
  getFarm: (id) => api.get(`/api/farms/${id}`),
  createFarm: (data) => api.post('/api/farms', data),
  updateFarm: (id, data) => api.put(`/api/farms/${id}`, data),
  deleteFarm: (id) => api.delete(`/api/farms/${id}`),

  // Fields
  getFields: (params) => api.get('/api/fields', { params }),
  getField: (id) => api.get(`/api/fields/${id}`),
  createField: (data) => api.post('/api/fields', data),
  updateField: (id, data) => api.put(`/api/fields/${id}`, data),
  deleteField: (id) => api.delete(`/api/fields/${id}`),

  // Crops
  getCrops: (params) => api.get('/api/crops', { params }),
  getCrop: (id) => api.get(`/api/crops/${id}`),
  createCrop: (data) => api.post('/api/crops', data),
  updateCrop: (id, data) => api.put(`/api/crops/${id}`, data),
  deleteCrop: (id) => api.delete(`/api/crops/${id}`),

  // Water
  getWaterResources: () => api.get('/api/water'),
  getWaterSummary: () => api.get('/api/water/summary'),
  createWaterResource: (data) => api.post('/api/water', data),
  updateWaterResource: (id, data) => api.put(`/api/water/${id}`, data),
  deleteWaterResource: (id) => api.delete(`/api/water/${id}`),

  // Electricity
  getElectricityRecords: () => api.get('/api/electricity'),
  getElectricitySummary: () => api.get('/api/electricity/summary'),
  createElectricityRecord: (data) => api.post('/api/electricity', data),

  // Weather
  getWeatherRecords: () => api.get('/api/weather'),
  getCurrentWeather: () => api.get('/api/weather/current'),
  createWeatherRecord: (data) => api.post('/api/weather', data),

  // AI Predictions
  predictWater: (data) => api.post('/api/predict-water', data),
  predictCropHealth: (data) => api.post('/api/predict-crop-health', data),
  predictYield: (data) => api.post('/api/predict-yield', data),
  predictElectricity: (data) => api.post('/api/predict-electricity', data),
  predictRisk: (data) => api.post('/api/predict-risk', data),
  getPredictionHistory: () => api.get('/api/predictions/history'),

  // Digital Twin Simulation
  runSimulation: (data) => api.post('/api/simulation', data),
  getSimulationHistory: () => api.get('/api/simulation/history'),

  // Alerts & Recommendations
  getAlerts: (params) => api.get('/api/alerts', { params }),
  acknowledgeAlert: (id) => api.post(`/api/alerts/${id}/acknowledge`),
  getRecommendations: (params) => api.get('/api/recommendations', { params }),

  // Datasets CSV Upload
  previewCsv: (formData) => api.post('/api/datasets/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCsv: (formData) => api.post('/api/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Reset
  resetDemo: () => api.post('/api/reset-demo')
};

export default api;
