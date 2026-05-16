import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectBoard from './pages/ProjectBoard';
import ProjectSettings from './pages/ProjectSettings';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectBoard />} />
            <Route path="/projects/:id/settings" element={<ProjectSettings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 29, 39, 0.8)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
