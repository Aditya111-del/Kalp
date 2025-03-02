import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleRegister = (e) => {
    e.preventDefault();
    // Registration logic would go here
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    alert(`Registration attempt with: ${email}`);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Grid with Animation */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          animation: 'moveGrid 10s linear infinite', // Add grid animation
        }}
      />

      {/* Animated Gradient Orbs */}
      <style>
        {`
          @keyframes moveGradient1 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(100px, 50px) scale(1.2); }
            66% { transform: translate(-50px, 100px) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes moveGradient2 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-100px, -50px) scale(0.8); }
            66% { transform: translate(50px, -100px) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes moveGradient3 {
            0% { transform: translate(-50%, -50%) scale(1); }
            33% { transform: translate(-50%, -50%) scale(1.2); }
            66% { transform: translate(-50%, -50%) scale(0.8); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }

          /* Grid Animation */
          @keyframes moveGrid {
            0% { background-position: 0 0; }
            100% { background-position: 100px 100px; }
          }
        `}
      </style>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl" style={{animation: 'moveGradient1 15s infinite ease-in-out'}} />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full opacity-10 blur-3xl" style={{animation: 'moveGradient2 18s infinite ease-in-out'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full opacity-10 blur-3xl" style={{animation: 'moveGradient3 20s infinite ease-in-out'}} />

      {/* Social Links */}
      <div className="fixed left-8 bottom-8 space-y-4 z-10">
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">𝕏</div>
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">f</div>
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">📸</div>
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 space-y-6 z-10">
        <div className="w-3 h-3 rounded-full bg-pink-200 cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-purple-500 cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-teal-400 cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            {/* Logo Icon */}
            <div className="inline-block mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-200 bg-opacity-20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-pink-200" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-white">
              Create Account
            </h1>
            
            {/* Description */}
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Join our community and get access to your AI advisor
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 space-y-6">
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="bg-gray-800 bg-opacity-50 text-white pl-10 pr-4 py-3 rounded-xl w-full border border-gray-700 focus:border-pink-200 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-gray-800 bg-opacity-50 text-white pl-10 pr-4 py-3 rounded-xl w-full border border-gray-700 focus:border-pink-200 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-gray-800 bg-opacity-50 text-white pl-10 pr-4 py-3 rounded-xl w-full border border-gray-700 focus:border-pink-200 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-gray-800 bg-opacity-50 text-white pl-10 pr-4 py-3 rounded-xl w-full border border-gray-700 focus:border-pink-200 focus:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-pink-200 text-black w-full py-3 rounded-xl font-medium hover:bg-pink-300 flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <button type="button" className="text-pink-200 hover:text-pink-300" onClick={() => navigate('/login')}>
                  Sign in
                </button>
              </p>
            </div>
          </div>
          
          {/* Terms */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              By registering, you agree to our <button className="text-gray-400 hover:text-white">Terms of Service</button> and <button className="text-gray-400 hover:text-white">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;