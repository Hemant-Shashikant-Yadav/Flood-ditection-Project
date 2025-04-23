import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://server-nu-indol.vercel.app/api';

export const api = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password });
    return response.data;
  }
};