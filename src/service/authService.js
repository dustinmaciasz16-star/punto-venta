import api from '../api/axios';

export const loginService = async (nick_usuario, contrasena) => {
  try {
    const response = await api.post('/auth/login.php', {
      nick_usuario,
      contrasena
    });

    if (response.data.status === 'success') {
      // Guardar el usuario autenticado en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Error al iniciar sesión');
    }
    throw new Error('Error de conexión con el servidor.');
  }
};

export const logoutService = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};