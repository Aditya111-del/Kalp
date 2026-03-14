import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedKalpLogo from './AnimatedKalpLogo';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedKalpLogo isAnimating={true} size="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          90% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        
        .line-animate-1 { animation: slideUp 8s infinite; animation-delay: 0s; }
        .line-animate-2 { animation: slideUp 8s infinite; animation-delay: 1.2s; }
        .line-animate-3 { animation: slideUp 8s infinite; animation-delay: 2.4s; }
        .line-animate-4 { animation: slideUp 8s infinite; animation-delay: 3.6s; }
        .line-animate-5 { animation: slideUp 8s infinite; animation-delay: 4.8s; }
      `}</style>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-12 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedKalpLogo size="w-6 h-6" />
            <span className="text-xs font-bold tracking-widest uppercase text-white">KALP</span>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-14">
            <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-medium">Features</button>
            <a href="#about" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-medium">About</a>
            <a href="#contact" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-medium">Contact</a>
          </nav>

          <button
            onClick={handleSignIn}
            className="px-5 py-2 text-xs font-bold border border-gray-400 hover:border-white hover:bg-white hover:text-black text-white transition-all duration-300 uppercase tracking-widest"
          >
            Try It
          </button>
        </div>
      </header>

      {/* Main Hero Section with Wavy Gradient */}
      <section className="relative w-full h-screen flex items-center justify-between overflow-hidden pt-20">
        {/* Animated Wavy SVG Background */}
        <svg 
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1200 800" 
          preserveAspectRatio="none"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9D4EDD', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#E0AAFF', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#FF006E', stopOpacity: 0.9 }} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF006E', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#FFB703', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#FB5607', stopOpacity: 0.9 }} />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#8338EC', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#3A86FF', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>

          {/* Main Wave Shape 1 */}
          <path
            d="M 0,200 Q 150,100 300,150 T 600,200 T 900,180 T 1200,150 L 1200,0 L 0,0 Z"
            fill="url(#grad1)"
          />

          {/* Wave Shape 2 */}
          <path
            d="M 0,300 Q 200,250 400,280 T 800,320 T 1200,300 L 1200,200 Q 900,180 600,200 T 0,200 Z"
            fill="url(#grad2)"
          />

          {/* Wave Shape 3 - Bottom Accent */}
          <path
            d="M 0,500 Q 100,480 200,500 T 600,520 T 1000,490 T 1200,500 L 1200,800 L 0,800 Z"
            fill="url(#grad3)"
            opacity="0.3"
          />
        </svg>

        {/* Content - Left Side */}
        <div className="absolute left-0 top-0 w-1/2 h-full flex flex-col items-start justify-between px-16 py-20 z-10">
          {/* Logo moved to header - removed from here */}
          <div></div>

          {/* Bottom left info */}
          <div className="text-xs text-gray-500 uppercase tracking-wider space-y-2 pb-8">
            <div className="font-semibold text-gray-600">KALP</div>
            <div>COMPANY</div>
            <div>NEWS</div>
            <div>CONTACT</div>
          </div>
        </div>
      </section>

      {/* Content Section Below Waves */}
      <section className="w-full bg-black py-32 px-20 flex justify-end z-10">
        <div className="w-80 space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl font-light leading-tight text-white">
              Your AI with Live<br />
              Internet Access
            </h1>
            
            <div className="text-xs text-gray-500 leading-relaxed font-light space-y-0.5 h-24">
              <div className="line-animate-1">Get real-time answers with</div>
              <div className="line-animate-2">web search, streaming responses,</div>
              <div className="line-animate-3">and beautiful source</div>
              <div className="line-animate-4">attribution. The future of</div>
              <div className="line-animate-5">intelligent conversation.</div>
            </div>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8 bg-black relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-light mb-24 text-center">Why Choose KALP</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌐', title: 'Live Web Search', desc: 'Access real-time information from across the internet with every query' },
              { icon: '⚡', title: 'Instant Streaming', desc: 'Watch responses appear in real-time as they\'re being generated' },
              { icon: '📚', title: 'Chat Memory', desc: 'Keep your conversation history organized and easily searchable' },
              { icon: '🔗', title: 'Source Badges', desc: 'Know exactly where information comes from with beautiful attribution' }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:bg-purple-950/10">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-gradient-to-b from-black via-purple-950/10 to-black relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-8 text-gray-200">Experience the Future of AI</h2>
          <p className="text-base text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
            Join thousands of users already experiencing smarter conversations powered by 
            real-time internet access and intelligent reasoning.
          </p>
          
          <button
            onClick={handleGetStarted}
            className="px-12 py-3 bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300 uppercase tracking-widest text-sm"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Bottom Chat Box Section */}
      <section className="w-full bg-black py-32 px-20 flex justify-end z-10 border-t border-gray-800">
        <div className="w-80">
          <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
            <input
              type="text"
              placeholder="Ask me anything..."
              onClick={handleGetStarted}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            <button
              onClick={handleGetStarted}
              className="text-white hover:text-purple-400 transition-colors text-xl"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-gray-800 bg-black relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedKalpLogo size="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">KALP AI</span>
          </div>
          <p className="text-xs text-gray-700">© 2025 KALP AI. Intelligent conversations redefined.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
