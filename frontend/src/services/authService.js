import api from '../api';

class AuthService {
  // Login user with username and password
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  }

  // Register new user with username and password
  async register(username, password) {
    try {
      const response = await api.post('/auth/register', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  }

  // Logout current user
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

export default new AuthService(); 