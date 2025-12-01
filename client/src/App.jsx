import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import EmbedPosts from './pages/EmbedPosts';
import DashboardHome from './pages/dashboard/DashboardHome';
import CreatePost from './pages/dashboard/CreatePost';
import MyPosts from './pages/dashboard/MyPosts';
import Analytics from './pages/dashboard/Analytics';
import Integrations from './pages/dashboard/Integrations';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="posts" element={<MyPosts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="integrations" element={<Integrations />} />
          </Route>
          <Route path="/embed" element={<EmbedPosts />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
