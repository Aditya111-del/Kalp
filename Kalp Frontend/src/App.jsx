import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import PromptInterface from './components/PromptInterface';
import KimiChat from './components/KimiChat';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <KimiChat />
            </ProtectedRoute>
          } />
          <Route path="/prompt" element={
            <ProtectedRoute>
              <PromptInterface />
            </ProtectedRoute>
          } />
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
