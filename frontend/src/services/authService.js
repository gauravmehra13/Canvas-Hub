import api from "../api";

class AuthService {
  // Login user with username and password
  async login(username, password) {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { user } = response.data;
      return { user };
    } catch (error) {
      throw error.response?.data?.error || "Login failed";
    }
  }

  // Register new user with username and password
  async register(username, password) {
    try {
      const response = await api.post("/auth/register", { username, password });
      const { user } = response.data;
      return { user };
    } catch (error) {
      throw error.response?.data?.error || "Registration failed";
    }
  }

  // Logout current user
  async logout() {
    await api.post("/auth/logout");
  }

  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await api.get("/auth/check-auth");
      return { user: response.data.user };
    } catch (error) {
      throw error.response?.data?.error || "Authentication check failed";
    }
  }
}

export default new AuthService();
