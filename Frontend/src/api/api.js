// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://djano-reactjs.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
