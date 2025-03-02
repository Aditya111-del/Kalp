import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PromptInterface = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Refs for chat messages, titles, and sections
  const userMessageRefs = useRef([]);
  const aiMessageRefs = useRef([]);
  const titleRef = useRef(null);
  const footerTitleRef = useRef(null);
  const sectionRefs = useRef([]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            entry.target.classList.remove('fade-out');
          } else {
            entry.target.classList.add('fade-out');
            entry.target.classList.remove('fade-in');
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all chat messages and sections
    userMessageRefs.current.forEach((ref) => ref && observer.observe(ref));
    aiMessageRefs.current.forEach((ref) => ref && observer.observe(ref));
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => {
      userMessageRefs.current.forEach((ref) => ref && observer.unobserve(ref));
      aiMessageRefs.current.forEach((ref) => ref && observer.unobserve(ref));
      sectionRefs.current.forEach((ref) => ref && observer.unobserve(ref));
    };
  }, []);

  // Parallax, fade, and divergence effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Parallax and fade for the main title
      if (titleRef.current) {
        const parallaxOffset = scrollY * 0.5;
        const opacity = 1 - scrollY / 200;
        titleRef.current.style.transform = `translateY(${parallaxOffset}px)`;
        titleRef.current.style.opacity = opacity > 0 ? opacity : 0;
      }

      // Smooth divergence effect for chat boxes
      userMessageRefs.current.forEach((ref, index) => {
        if (ref) {
          const userOffset = scrollY * 0.2;
          ref.style.transition = 'transform 0.2s ease-out'; // Add smooth transition
          ref.style.transform = `translateX(${userOffset}px)`;
        }
      });
      aiMessageRefs.current.forEach((ref, index) => {
        if (ref) {
          const aiOffset = scrollY * -0.2;
          ref.style.transition = 'transform 0.2s ease-out'; // Add smooth transition
          ref.style.transform = `translateX(${aiOffset}px)`;
        }
      });

      // Show footer title when scrolled to the bottom
      if (footerTitleRef.current) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (scrollY + windowHeight >= documentHeight - 100) {
          footerTitleRef.current.style.opacity = 1;
          footerTitleRef.current.style.transform = 'translateY(0)';
        } else {
          footerTitleRef.current.style.opacity = 0;
          footerTitleRef.current.style.transform = 'translateY(20px)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          animation: 'moveGrid 10s linear infinite',
        }}
      />

      {/* Animated Gradient Orbs */}
      <style>
        {`
          @keyframes moveGradient1 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(100px, 50px) scale(1.2); } 66% { transform: translate(-50px, 100px) scale(0.8); } 100% { transform: translate(0, 0) scale(1); } }
          @keyframes moveGradient2 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-100px, -50px) scale(0.8); } 66% { transform: translate(50px, -100px) scale(1.2); } 100% { transform: translate(0, 0) scale(1); } }
          @keyframes moveGradient3 { 0% { transform: translate(-50%, -50%) scale(1); } 33% { transform: translate(-50%, -50%) scale(1.2); } 66% { transform: translate(-50%, -50%) scale(0.8); } 100% { transform: translate(-50%, -50%) scale(1); } }
          .gradient-orb-1 { animation: moveGradient1 15s infinite ease-in-out; }
          .gradient-orb-2 { animation: moveGradient2 18s infinite ease-in-out; }
          .gradient-orb-3 { animation: moveGradient3 20s infinite ease-in-out; }

          /* Fade-in Animation */
          @keyframes fadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .fade-in { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out; }

          /* Fade-out Animation */
          @keyframes fadeOut { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(20px); } }
          .fade-out { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out; }

          /* Gradient Glassmorphism Effect */
          .gradient-glass { background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; transition: all 0.3s ease-in-out; box-shadow: 0 2px 10px rgba(255, 255, 255, 0.05); }
          .gradient-glass:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1); }

          /* Grid Animation */
          @keyframes moveGrid { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
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

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-12">
          {/* Introduction Section */}
          <div ref={(el) => (sectionRefs.current[0] = el)} className="text-center space-y-6">
            <div className="inline-block mb-2">
              <div className="w-8 h-8 rounded-lg bg-pink-200 bg-opacity-20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-pink-200" />
              </div>
            </div>
            <h1 ref={titleRef} className="text-5xl font-bold text-white leading-tight transition-transform duration-300">
              KALP AI <br />
            </h1>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              These are just a few of the many attractions Paris has to offer. Let me know if you'd like more information or details on anything specific!
            </p>
          </div>

          {/* Prompt Input Area */}
          <div className="gradient-glass p-3 border border-gray-800">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Write a message"
                className="bg-transparent text-white px-4 py-3 flex-1 focus:outline-none text-sm font-medium"
              />
              <button
                className="bg-pink-200 text-black px-6 py-2 rounded-xl font-medium hover:bg-pink-300 transition-colors"
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Conversation Section */}
          <div className="space-y-12">
            {/* Introduction Chat */}
            <div className="flex justify-end" ref={(el) => (userMessageRefs.current[0] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] ml-auto">
                <div className="gradient-glass p-4 rounded-2xl rounded-br-none">
                  <p className="text-white font-medium">Hey Kalp, I heard this AI can also help with creative tasks like writing stories, generating ideas, and even composing music. Is that true?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start" ref={(el) => (aiMessageRefs.current[0] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] mr-auto">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="gradient-glass p-4 rounded-2xl rounded-bl-none">
                  <p className="text-white font-medium">Absolutely! This AI is equipped with creative capabilities. Whether you need a story idea, a poem, or even a melody, it can generate unique and creative content tailored to your needs.</p>
                </div>
              </div>
            </div>

            {/* Technical Chat */}
            <div className="flex justify-end" ref={(el) => (userMessageRefs.current[1] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] ml-auto">
                <div className="gradient-glass p-4 rounded-2xl rounded-br-none">
                  <p className="text-white font-medium">Can you explain how the AI handles technical tasks like coding or debugging?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start" ref={(el) => (aiMessageRefs.current[1] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] mr-auto">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="gradient-glass p-4 rounded-2xl rounded-bl-none">
                  <p className="text-white font-medium">Of course! The AI can assist with writing code, debugging, and even optimizing algorithms. It supports multiple programming languages and frameworks, making it a versatile tool for developers.</p>
                </div>
              </div>
            </div>

            {/* Informative Charts Chat */}
            <div className="flex justify-end" ref={(el) => (userMessageRefs.current[2] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] ml-auto">
                <div className="gradient-glass p-4 rounded-2xl rounded-br-none">
                  <p className="text-white font-medium">Can the AI generate charts or visualizations for data analysis?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start" ref={(el) => (aiMessageRefs.current[2] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] mr-auto">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="gradient-glass p-4 rounded-2xl rounded-bl-none">
                  <p className="text-white font-medium">Yes, it can! The AI can create charts, graphs, and visualizations to help you analyze data more effectively. It supports various chart types like bar charts, line graphs, and pie charts.</p>
                </div>
              </div>
            </div>

            {/* Logics Chat */}
            <div className="flex justify-end" ref={(el) => (userMessageRefs.current[3] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] ml-auto">
                <div className="gradient-glass p-4 rounded-2xl rounded-br-none">
                  <p className="text-white font-medium">How does the AI handle logical reasoning and problem-solving?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start" ref={(el) => (aiMessageRefs.current[3] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] mr-auto">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="gradient-glass p-4 rounded-2xl rounded-bl-none">
                  <p className="text-white font-medium">The AI uses advanced algorithms to perform logical reasoning and solve complex problems. It can break down problems into smaller steps and provide step-by-step solutions.</p>
                </div>
              </div>
            </div>

            {/* Science Chat */}
            <div className="flex justify-end" ref={(el) => (userMessageRefs.current[4] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] ml-auto">
                <div className="gradient-glass p-4 rounded-2xl rounded-br-none">
                  <p className="text-white font-medium">Can the AI assist with scientific research or experiments?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start" ref={(el) => (aiMessageRefs.current[4] = el)}>
              <div className="flex items-end gap-6 max-w-[70%] mr-auto">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="gradient-glass p-4 rounded-2xl rounded-bl-none">
                  <p className="text-white font-medium">Absolutely! The AI can help with scientific research by analyzing data, generating hypotheses, and even suggesting experiments. It can also provide insights based on existing research.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Title */}
      <div
        ref={footerTitleRef}
        className="fixed bottom-0 left-0 w-full text-center py-8 opacity-0 transform translate-y-20 transition-all duration-500"
        style={{ marginBottom: '100px' }}
      >
        <h1 className="text-5xl font-bold text-white leading-tight">
          Your Personal<br />AI Advisor
        </h1>
      </div>

      {/* Extra Space at the Bottom */}
      <div className="h-48"></div>
    </div>
  );
};

export default PromptInterface;