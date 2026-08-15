import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../utils/api';

const API_BASE_URL = API_BASE;

function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [pending, setPending] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null); // prof id currently being approved/rejected

  const fetchPending = useCallback(async (authToken) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/professional/admin/pending`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error || 'Could not load pending applications.');
        return;
      }
      setPending(data.pending || []);
    } catch (err) {
      setLoadError('Could not reach the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Login failed.');
        setIsLoggingIn(false);
        return;
      }

      setToken(data.token);
      await fetchPending(data.token);
    } catch (err) {
      setLoginError('Could not reach the server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleApprove = async (profId) => {
    setBusyId(profId);
    setActionError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/professional/admin/${profId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.error || 'Could not approve this application.');
        return;
      }
      setPending((prev) => prev.filter((p) => p.id !== profId));
    } catch (err) {
      setActionError('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (profId) => {
    const reason = window.prompt('Reason for rejecting this application:');
    if (reason === null) return; // cancelled

    setBusyId(profId);
    setActionError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/professional/admin/${profId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || 'Credentials could not be verified' }),
      });
      const data = await response.json();

      if (!response.ok) {
        setActionError(data.error || 'Could not reject this application.');
        return;
      }
      setPending((prev) => prev.filter((p) => p.id !== profId));
    } catch (err) {
      setActionError('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  };

  // --- Login view ---
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-surface-container-lowest px-6">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-white text-xl">shield_person</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Admin Sign In</h1>
            <p className="text-sm text-on-surface-variant">
              Sign in with your admin-flagged MindEase account.
            </p>
          </div>

          {loginError && (
            <div className="bg-error-container/40 border border-error/30 text-error text-sm rounded-xl px-4 py-3">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                Email
              </label>
              <input
                required
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                Password
              </label>
              <input
                required
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Link to="/" className="text-primary text-sm font-semibold hover:underline block text-center">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Dashboard view ---
  return (
    <div className="min-h-screen bg-surface-container-lowest px-6 py-10 md:px-16">
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Professional Applications</h1>
            <p className="text-sm text-on-surface-variant">Review credentials before approving access.</p>
          </div>
          <button
            onClick={() => fetchPending(token)}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>

        {actionError && (
          <div className="bg-error-container/40 border border-error/30 text-error text-sm rounded-xl px-4 py-3">
            {actionError}
          </div>
        )}

        {loadError && (
          <div className="bg-error-container/40 border border-error/30 text-error text-sm rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-on-surface-variant">Loading applications...</p>
        )}

        {!isLoading && pending.length === 0 && !loadError && (
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">inbox</span>
            <p className="text-sm text-on-surface-variant">No pending applications right now.</p>
          </div>
        )}

        <div className="space-y-4">
          {pending.map((prof) => (
            <div
              key={prof.id}
              className="bg-surface border border-outline-variant/60 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">{prof.full_name}</h2>
                  <p className="text-sm text-on-surface-variant">{prof.email}</p>
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {prof.credential_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs">License Number</p>
                  <p className="text-on-surface font-medium">{prof.license_number}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Issuing Body</p>
                  <p className="text-on-surface font-medium">{prof.issuing_body}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Years Experience</p>
                  <p className="text-on-surface font-medium">{prof.years_experience}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs">Specializations</p>
                  <p className="text-on-surface font-medium">
                    {(prof.specializations || []).join(', ') || '—'}
                  </p>
                </div>
              </div>

              {prof.bio && (
                <p className="text-sm text-on-surface-variant border-t border-outline-variant/40 pt-3">
                  {prof.bio}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`${API_BASE_URL}/api/professional/admin/${prof.id}/document`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // fetch with auth header, since <a> can't send headers directly
                    e.preventDefault();
                    fetch(`${API_BASE_URL}/api/professional/admin/${prof.id}/document`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                      .then((res) => res.blob())
                      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
                  }}
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  View Credential Document
                </a>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/40">
                <button
                  onClick={() => handleApprove(prof.id)}
                  disabled={busyId === prof.id}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Approve
                </button>
                <button
                  onClick={() => handleReject(prof.id)}
                  disabled={busyId === prof.id}
                  className="flex-1 bg-error text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-error/90 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;