import React, { useState } from 'react';
import { Send } from 'lucide-react';

const PromptInterface = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-12">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">Your Personal AI Advisor</h1>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              AI-driven insights for your queries.
            </p>
            <div className="flex gap-3 justify-center mt-6 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-gray-900 text-white px-4 py-2 rounded-xl flex-1 border border-gray-800 focus:border-pink-200 focus:outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="bg-pink-200 text-black px-6 py-2 rounded-xl font-medium hover:bg-pink-300 transition-colors">
                Join Beta
              </button>
            </div>
          </div>
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