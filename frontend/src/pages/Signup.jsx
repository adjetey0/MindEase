import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import axios from 'axios';
import API_BASE from '../utils/api';

function Signup() {
  const navigate = useNavigate();
  const { updateProfile } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) return;

    try {
      await axios.post(`${API_BASE}/api/auth/signup`, {
        name,
        email,
        password
      });
    } catch (error) {
      console.error("Signup error:", error);
    }

    updateProfile({
      name: name || 'New User',
      email: email || 'user@mindease.care'
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-on-background">
      {/* Left Image Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80"
          alt="Peaceful sunset landscape"
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
            Begin your path to a<br />
            <span className="text-primary-fixed">calmer mind.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-full drop-shadow">
            Join thousands building better mental health every day with MindEase.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface-container-lowest px-6 py-16 sm:px-10 md:px-16 relative overflow-hidden">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link to="/" className="lg:hidden font-bold text-xl text-primary tracking-tight">MindEase</Link>
          <Link to="/" className="hidden lg:flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/login" className="text-primary text-sm font-semibold hover:underline">
            Log In
          </Link>
        </div>

        <div className="w-full max-w-[420px] space-y-6 animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Create your account ✨</h1>
            <p className="text-on-surface-variant text-sm">Free access to core mental wellness tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-on-surface">
                Full Name
              </label>
              <input
                required
                id="name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                Email Address
              </label>
              <input
                required
                id="email"
                type="email"
                placeholder="alex.morgan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
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

            <div className="flex items-start gap-2.5 pt-1">
              <input
                required
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant cursor-pointer leading-relaxed">
                I agree to the Terms of Service &amp; Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-98 transition-all shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;