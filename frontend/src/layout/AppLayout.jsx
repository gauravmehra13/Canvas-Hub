import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

export const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '0.5rem',
          },
        }}
      />
      {!hideNavbar && <Navbar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};