import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const PromptInterface = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
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
          .gradient-orb-1 {
            animation: moveGradient1 15s infinite ease-in-out;
          }
          .gradient-orb-2 {
            animation: moveGradient2 18s infinite ease-in-out;
          }
          .gradient-orb-3 {
            animation: moveGradient3 20s infinite ease-in-out;
          }
        `}
      </style>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl gradient-orb-1" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full opacity-10 blur-3xl gradient-orb-2" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full opacity-10 blur-3xl gradient-orb-3" />

      {/* Social Links */}
      <div className="fixed left-8 bottom-8 space-y-4 z-10">
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">𝕏</div>
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">f</div>
        <div className="text-white opacity-50 hover:opacity-100 cursor-pointer transition-opacity">📸</div>
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 space-y-6 z-10">
        <div className="w-3 h-3 rounded-full bg-pink-200 cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-purple-500 cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-teal-400 cursor-pointer" />
      </div>

      {/* Get Started Button */}
      <div className="fixed top-8 right-8 z-10">
        <button
          className="bg-pink-200 text-black px-6 py-2 rounded-xl font-medium hover:bg-pink-300 transition-colors"
          onClick={() => navigate('/register')}
        >
          Get Started
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-6">
            {/* Logo Icon */}
            <div className="inline-block mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-200 bg-opacity-20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-pink-200" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl font-bold text-white leading-tight">
              Your Personal<br />AI Advisor
            </h1>
            
            {/* Description */}
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              These are just a few of the many attractions Paris has to offer. Let me know if you'd like more information or details on anything specific!
            </p>
            
            {/* Email subscription */}
            <div className="flex gap-3 justify-center mt-6 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-gray-900 text-white px-4 py-2 rounded-xl flex-1 bg-opacity-50 backdrop-blur-sm border border-gray-800 focus:border-pink-200 focus:outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="bg-pink-200 text-black px-6 py-2 rounded-xl font-medium hover:bg-pink-300 transition-colors">
                Join Beta
              </button>
            </div>
          </div>

          {/* Prompt Input Area */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl p-3 border border-gray-800">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Write a message"
                className="bg-transparent text-white px-4 py-3 flex-1 focus:outline-none text-sm"
              />
              <button className="bg-pink-200 p-2 rounded-xl hover:bg-pink-300 transition-colors">
                <Send className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInterface;