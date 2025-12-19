
import { useAuth } from '@/stores/useAuth';
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuth();
    // console.log(token)
    if(token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  response => response.data,
  (error) => {
    throw error;
    if(error.response?.status === 401) {
      // api.post('auth/refresh-token', {
      //   refresh_token: localStorage.getItem('refreshToken')
      // })
    }
  }
)
export default api