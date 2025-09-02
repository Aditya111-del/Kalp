import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedKalpLogo from './AnimatedKalpLogo';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [features] = useState([
    {
      icon: '🤖',
      title: 'AI-Powered Conversations',
      description: 'Engage with advanced AI that understands context and provides meaningful responses'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Real-time responses with optimized performance for seamless interaction'
    },
    {
      icon: '🎨',
      title: 'Beautiful Interface',
      description: 'Modern, intuitive design with code highlighting and table formatting'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your conversations are encrypted and your privacy is our priority'
    }
  ]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <AnimatedKalpLogo isAnimating={true} size="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedKalpLogo size="w-8 h-8" />
            <span className="text-2xl font-bold tracking-wider">KALP</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={scrollToFeatures}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </button>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#5a1fcf] to-[#d4145a] rounded-lg font-medium hover:from-[#6b2bdf] hover:to-[#e4256a] transition-all disabled:opacity-50"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <AnimatedKalpLogo isAnimating={true} size="w-24 h-24" />
          </div>
          <h1 className="text-7xl md:text-8xl font-bold tracking-wider mb-6 bg-gradient-to-r from-[#5a1fcf] via-[#d4145a] to-[#e87d15] bg-clip-text text-transparent">
            KALP
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Your Advanced AI Companion for Intelligent Conversations
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Experience the future of AI interaction with our sophisticated chat interface, 
            complete with code highlighting, table formatting, and contextual understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#5a1fcf] to-[#d4145a] rounded-lg font-medium hover:from-[#6b2bdf] hover:to-[#e4256a] transition-all min-w-[200px] justify-center text-white"
            >
              <span>Get Started</span>
            </button>
            
            <button
              onClick={handleSignIn}
              className="px-8 py-4 border border-[#3a3a3a] rounded-lg font-medium hover:border-[#4a4a4a] hover:bg-[#1a1a1a] transition-all"
            >
              Sign In
            </button>
            
            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 border border-[#3a3a3a] rounded-lg font-medium hover:border-[#4a4a4a] hover:bg-[#1a1a1a] transition-all"
            >
              Explore Features
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#5a1fcf] mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#d4145a] mb-2">1M+</div>
              <div className="text-gray-400">Messages Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#e87d15] mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover what makes KALP the most advanced AI chat platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#3a3a3a] transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Chatting?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of users who are already experiencing the future of AI conversation.
          </p>
          
          <button
            onClick={handleGetStarted}
            className="flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-[#5a1fcf] to-[#d4145a] rounded-xl font-semibold text-lg hover:from-[#6b2bdf] hover:to-[#e4256a] transition-all mx-auto text-white"
          >
            <span>Get Started Now</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <AnimatedKalpLogo size="w-6 h-6" />
              <span className="text-xl font-bold">KALP AI</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 KALP AI. All rights reserved.</p>
              <p className="text-sm mt-1">Built with ❤️ for the future of AI conversation</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
