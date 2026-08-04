import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const { updateProfile, signIn } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://192.168.0.103:5000/api/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      updateProfile({
        email: res.data.user.email,
        name: res.data.user.full_name || email.split('@')[0]
      });
      signIn();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-on-background">
      {/* Left Image Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
          alt="Serene wellness scene"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <Link to="/" className="absolute top-8 left-8 z-10 flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-lg fill-icon">spa</span>
          </div>
          <span className="text-[22px] font-bold text-white tracking-tight drop-shadow-lg">MindEase</span>
        </Link>

        <div className="absolute bottom-10 left-8 right-8 z-10 space-y-2">
          <h2 className="text-3xl xl:text-[38px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-lg">
            Take a deep breath.<br />
            <span className="text-primary-fixed">You are back.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-full drop-shadow">
            Reconnect with your goals and continue building your mental resilience.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface-container-lowest px-6 py-12 sm:px-10 md:px-16 relative overflow-hidden">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link to="/" className="lg:hidden font-bold text-xl text-primary tracking-tight">MindEase</Link>
          <Link to="/" className="hidden lg:flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/signup" className="text-primary text-sm font-semibold hover:underline">
            Sign Up
          </Link>
        </div>

        <div className="w-full max-w-[420px] space-y-7 animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Welcome back 👋</h1>
            <p className="text-on-surface-variant text-sm">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <input
                  required
                  id="email"
                  type="email"
                  placeholder="alex.morgan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  required
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-98 transition-all duration-150 shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;