import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import API_BASE from '../utils/api';

const API_BASE_URL = API_BASE;
const SOCKET_URL = API_BASE;

function ProfessionalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [professional, setProfessional] = useState(null); // set after successful login
  const [token, setToken] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState('');

  // Real-time call state
  const socketRef = useRef(null);
  const [socketStatus, setSocketStatus] = useState('disconnected'); // disconnected | connected
  const [waitingSession, setWaitingSession] = useState(null); // session_id of a user waiting, or null
  const [activeCallSession, setActiveCallSession] = useState(null); // session_id of the call in progress
  const [socketNotice, setSocketNotice] = useState('');

  // Connect the socket once we know who this professional is. Disconnect on unmount
  // or if they log out, so we never leave a stale connection open.
  useEffect(() => {
    if (!professional || professional.status !== 'verified') return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));

    socket.on('volunteer_error', (data) => {
      setSocketNotice(data.error || 'A real-time connection error occurred.');
    });

    socket.on('user_waiting', (data) => {
      setWaitingSession(data.session_id);
      setSocketNotice(data.message);
    });

    socket.on('no_users_waiting', (data) => {
      setWaitingSession(null);
      setSocketNotice(data.message);
    });

    socket.on('call_accepted', (data) => {
      setSocketNotice(data.message);
    });

    socket.on('volunteer_status', (data) => {
      setSocketNotice(`You are now ${data.status}.`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [professional]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setRejectionReason('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/professional/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed. Please try again.');
        if (data.rejection_reason) setRejectionReason(data.rejection_reason);
        setIsSubmitting(false);
        return;
      }

      setToken(data.token);
      setProfessional(data.professional);
      setIsAvailable(data.professional.is_available);
    } catch (err) {
      setErrorMessage('Could not reach the server. Is your backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    setToggleError('');
    const nextValue = !isAvailable;

    try {
      // 1. Persist the change via the regular API (source of truth in the DB)
      const response = await fetch(`${API_BASE_URL}/api/professional/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: nextValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToggleError(data.error || 'Could not update availability.');
        setIsToggling(false);
        return;
      }

      setIsAvailable(nextValue);

      // 2. Tell the socket layer too, so it can join/leave the professional's
      // room and start/stop real-time "user waiting" notifications.
      if (socketRef.current) {
        socketRef.current.emit(nextValue ? 'volunteer_online' : 'volunteer_offline', { token });
      }
      if (!nextValue) {
        setWaitingSession(null);
      }
    } catch (err) {
      setToggleError('Could not reach the server.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAcceptCall = () => {
    if (!socketRef.current || !waitingSession) return;
    socketRef.current.emit('volunteer_accept_call', {
      token,
      session_id: waitingSession,
    });
    setActiveCallSession(waitingSession);
    setWaitingSession(null);
  };

  const handleEndCall = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('volunteer_end_call', { token });
    setActiveCallSession(null);
  };

  // --- Logged-in view ---
  if (professional) {
    const isVerified = professional.status === 'verified';

    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-surface-container-lowest px-6">
        <div className="w-full max-w-[420px] space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-2xl">
              {isVerified ? 'verified' : 'hourglass_top'}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Welcome back, {professional.full_name}
            </h1>
            <p className="text-sm text-on-surface-variant capitalize">
              Status: <span className="font-semibold">{professional.status}</span>
            </p>
          </div>

          {isVerified ? (
            <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">
                {isAvailable
                  ? "You're online and visible to users who need support."
                  : "You're offline. Toggle on when you're ready to take calls."}
              </p>

              {toggleError && (
                <p className="text-sm text-error">{toggleError}</p>
              )}

              <button
                onClick={handleToggleAvailability}
                disabled={isToggling}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isAvailable
                    ? 'bg-error text-white shadow-error/20 hover:bg-error/90'
                    : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isAvailable ? 'toggle_on' : 'toggle_off'}
                </span>
                <span>
                  {isToggling
                    ? 'Updating...'
                    : isAvailable
                    ? 'Go Offline'
                    : 'Go Online'}
                </span>
              </button>

              {isAvailable && (
                <div className="text-xs text-on-surface-variant flex items-center justify-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      socketStatus === 'connected' ? 'bg-primary' : 'bg-error'
                    }`}
                  />
                  Real-time connection: {socketStatus}
                </div>
              )}

              {socketNotice && (
                <p className="text-xs text-on-surface-variant bg-surface-container-lowest rounded-lg px-3 py-2">
                  {socketNotice}
                </p>
              )}

              {waitingSession && !activeCallSession && (
                <button
                  onClick={handleAcceptCall}
                  className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  Accept Waiting Call
                </button>
              )}

              {activeCallSession && (
                <button
                  onClick={handleEndCall}
                  className="w-full bg-error text-white py-3 rounded-xl text-sm font-semibold hover:bg-error/90 transition-all shadow-lg shadow-error/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">call_end</span>
                  End Call
                </button>
              )}
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant/60 rounded-xl p-6">
              <p className="text-sm text-on-surface-variant">
                Your application is still under review. You'll be able to go online and
                receive calls once an admin approves your credentials.
              </p>
            </div>
          )}

          <Link to="/" className="text-primary text-sm font-semibold hover:underline block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Login form view ---
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-on-background">
      {/* Left Image Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80"
          alt="Counsellor at work"
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
            Welcome back,<br />
            <span className="text-primary-fixed">counsellor.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-full drop-shadow">
            Sign in to manage your availability and connect with people who need support.
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
          <Link to="/staff-application-kn74x" className="text-primary text-sm font-semibold hover:underline">
            Apply as Professional
          </Link>
        </div>

        <div className="w-full max-w-[420px] space-y-7 animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Professional Sign In</h1>
            <p className="text-on-surface-variant text-sm">
              For verified counsellors, psychologists, and mental health professionals.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-error-container/40 border border-error/30 text-error text-sm rounded-xl px-4 py-3 space-y-1">
              <p>{errorMessage}</p>
              {rejectionReason && (
                <p className="text-xs opacity-80">Reason: {rejectionReason}</p>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                Email Address
              </label>
              <input
                required
                id="email"
                type="email"
                placeholder="ama.boateng@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-98 transition-all duration-150 shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              {!isSubmitting && <span className="material-symbols-outlined text-base">arrow_forward</span>}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Not a professional?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Regular sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalLogin;