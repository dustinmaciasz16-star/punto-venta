import axios from 'axios';

const api = axios.create({
  // Ajusta la URL según tu servidor local (XAMPP, WAMP, PHP CLI, etc.)
  baseURL: 'http://localhost:8080/', // Cambia esto según la ubicación de tu API
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;