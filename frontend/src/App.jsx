import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { useAuth } from './hooks/useAuth';

const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/rooms" : "/login"} />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '0.5rem',
                }
              }}
            />
            <Navbar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
                <Route path="/rooms/:id" element={<PrivateRoute><Room /></PrivateRoute>} />
                <Route path="/" element={<RootRedirect />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;