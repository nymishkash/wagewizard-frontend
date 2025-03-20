import axios from 'axios';

// const BASE_URL = 'https://ww-api.nymish.xyz'; //prod
const BASE_URL = 'http://localhost:8081'; //dev

const wwAPI = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the auth token
wwAPI.interceptors.request.use(
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

export { BASE_URL, wwAPI };
