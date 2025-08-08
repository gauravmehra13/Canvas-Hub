import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";
import { isTokenValid } from "../utils/authUtils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData && isTokenValid(token)) {
      setUser(JSON.parse(userData));
    } else {
      // Remove invalid/expired token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { user } = await authService.login(username, password);
    setUser(user);
    return user;
  };

  const register = async (username, password) => {
    const { user } = await authService.register(username, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
