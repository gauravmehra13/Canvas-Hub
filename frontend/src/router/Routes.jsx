import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Rooms from '../pages/Rooms';
import Room from '../pages/Room';
import NotFound from '../pages/NotFound';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RootRedirect from './RootRedirect';
import { AppLayout } from '../layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: 'login',
        element: <PublicRoute><Login /></PublicRoute>,
      },
      {
        path: 'register',
        element: <PublicRoute><Register /></PublicRoute>,
      },
      {
        path: 'rooms',
        element: <PrivateRoute><Rooms /></PrivateRoute>,
      },
      {
        path: 'rooms/:id',
        element: <PrivateRoute><Room /></PrivateRoute>,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);