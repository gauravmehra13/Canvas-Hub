import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Palette, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { theme, commonClasses } from '../styles/theme';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <nav className={theme.navbar.base}>
      <div className={`${theme.layout.container} ${theme.navbar.container}`}>
        <div className={theme.navbar.brand}>
          <Palette className="h-6 w-6 text-blue-600" />
          <span>Canvas Hub</span>
        </div>

        {user && (
          <div className={commonClasses.flexBetween + " flex-1"}>
            <div className="flex items-center space-x-2">
              {/* Add any navigation links here */}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={commonClasses.flexCenter + " space-x-2"}>
                <User className="h-4 w-4 text-gray-500" />
                <span className={theme.text.subtitle}>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className={theme.button.destructive}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 