import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PromptInterface from './components/PromptInterface';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PromptInterface />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;