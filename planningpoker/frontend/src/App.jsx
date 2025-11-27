import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';
import { authAPI } from './lib/api';
import { socketClient } from './lib/socket';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';

// Layout
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, setUser, token, logout } = useStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
          socketClient.connect(token);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      }
    };

    fetchUser();

    // Note: Don't disconnect socket on unmount in development
    // React StrictMode causes double mounting which would disconnect prematurely
    // Socket will disconnect when user logs out or closes browser
    // return () => {
    //   socketClient.disconnect();
    // };
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
