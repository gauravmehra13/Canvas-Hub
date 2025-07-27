import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, User, Lock } from 'lucide-react';
import { theme, commonClasses } from '../styles/theme';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.token);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className={theme.layout.authCard}>
        <div className="text-center space-y-2">
          <div className={commonClasses.flexCenter}>
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className={theme.text.title}>Create an account</h1>
          <p className={theme.text.subtitle}>
            Enter your details to create your account
          </p>
        </div>

        {error && <div className={theme.text.error}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="username"
                className={theme.input.base + " " + theme.input.withIcon}
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="password"
                name="password"
                className={theme.input.base + " " + theme.input.withIcon}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button type="submit" className={theme.button.primary + " w-full"}>
            Create Account
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span>
          </div>
        </div>

        <p className="text-center">
          <span className={theme.text.subtitle}>Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;