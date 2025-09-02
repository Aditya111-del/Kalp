import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedKalpLogo from './AnimatedKalpLogo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login form submitted:', { email });
    setLoading(true);
    setError('');
    
    try {
      console.log('Calling login function...');
      await login(email, password);
      console.log('Login successful, navigating to chat...');
      navigate('/chat');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await googleLogin();
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AnimatedKalpLogo isAnimating={true} size="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-wider">KALP</h1>
            <p className="text-gray-400 mt-2 text-lg">Welcome back</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="bg-[#1f2023] rounded-2xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent p-6 text-white placeholder-gray-400 outline-none text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="bg-[#1f2023] rounded-2xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors">
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent p-6 text-white placeholder-gray-400 outline-none text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#5a1fcf] to-[#d4145a] text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-[#6b2bdf] hover:to-[#e4256a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-[#3a3a3a]"></div>
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-[#3a3a3a]"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-[#1f2023] border border-[#3a3a3a] text-white py-4 px-6 rounded-2xl font-medium text-lg hover:border-[#4a4a4a] hover:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          {/* Create Account Link */}
          <div className="text-center pt-4">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-white hover:text-gray-300 font-medium underline underline-offset-2"
                onClick={() => navigate('/register')}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
        
        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;