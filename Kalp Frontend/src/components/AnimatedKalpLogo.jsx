import React from 'react';

const AnimatedKalpLogo = ({ isAnimating, size = "w-6 h-6" }) => {
  // Inject animation styles into document head only once
  React.useEffect(() => {
    const styleId = 'kalp-logo-animation-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .star-emerging {
          animation: diagonalEmergence 3s ease-in-out infinite;
        }
        
        @keyframes diagonalEmergence {
          0% { 
            transform: scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
          }
          
          20% {
            transform: scale(0.3) translateX(-50px) translateY(-50px);
            opacity: 0.3;
            filter: drop-shadow(0 0 10px rgba(90, 31, 207, 0.8));
          }
          
          40% {
            transform: scale(0.3) translateX(50px) translateY(-50px);
            opacity: 0.3;
            filter: drop-shadow(0 0 10px rgba(212, 20, 90, 0.8));
          }
          
          60% {
            transform: scale(0.3) translateX(50px) translateY(50px);
            opacity: 0.3;
            filter: drop-shadow(0 0 10px rgba(232, 76, 26, 0.8));
          }
          
          80% {
            transform: scale(0.3) translateX(-50px) translateY(50px);
            opacity: 0.3;
            filter: drop-shadow(0 0 10px rgba(232, 125, 21, 0.8));
          }
          
          100% { 
            transform: scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`${size} relative`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1024 1024" 
        className="w-full h-full"
        role="img" 
        aria-label="Star app logo dark contrast"
      >
        <defs>
          {/* main diagonal gradient (darker + stronger contrast) */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a1ca8"/>
            <stop offset="28%" stopColor="#5a1fcf"/>
            <stop offset="50%" stopColor="#d4145a"/>
            <stop offset="78%" stopColor="#e24c1a"/>
            <stop offset="100%" stopColor="#e87d15"/>
          </linearGradient>

          {/* stronger magenta center */}
          <radialGradient id="magentaPush" cx="40%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#d4145a" stopOpacity="0.55"/>
            <stop offset="40%" stopColor="#d4145a" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#d4145a" stopOpacity="0"/>
          </radialGradient>

          {/* stronger orange bottom-right */}
          <radialGradient id="orangePush" cx="82%" cy="82%" r="45%">
            <stop offset="0%" stopColor="#e85f0f" stopOpacity="0.45"/>
            <stop offset="55%" stopColor="#e85f0f" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#e85f0f" stopOpacity="0"/>
          </radialGradient>

          {/* bright glow behind star */}
          <radialGradient id="starGlow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* background */}
        <g shapeRendering="geometricPrecision">
          <rect x="0" y="0" width="1024" height="1024" rx="160" ry="160" fill="url(#bgGrad)"/>
          <rect x="0" y="0" width="1024" height="1024" rx="160" ry="160" fill="url(#magentaPush)" opacity="1"/>
          <rect x="0" y="0" width="1024" height="1024" rx="160" ry="160" fill="url(#orangePush)" opacity="1"/>
        </g>

        {/* central glow */}
        <ellipse cx="512" cy="512" rx="240" ry="220" fill="url(#starGlow)"/>

        {/* star with animation */}
        <polygon 
          points="512,192 572,448 816,512 572,576 512,832 452,576 208,512 452,448" 
          fill="#ffffff" 
          vectorEffect="non-scaling-stroke"
          className={isAnimating ? 'star-emerging' : ''}
        />
      </svg>
    </div>
  );
};

export default AnimatedKalpLogo;
