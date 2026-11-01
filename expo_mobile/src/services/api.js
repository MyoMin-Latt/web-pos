import axios from 'axios';
import { API_BASE } from '../config';
import { getToken } from './storage';

const api = axios.create({ baseURL: API_BASE });

// Same auth scheme as the web app: Bearer token stored on device.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
