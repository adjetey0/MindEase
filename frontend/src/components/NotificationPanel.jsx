import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, readIds, markRead, markAllRead, dismissNotification } =
    useNotifications();
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Small delay so the opening click itself doesn't trigger it
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const programs = notifications.filter((n) => n.type === 'program');
  const community = notifications.filter((n) => n.type === 'community');

  const renderItem = (n) => {
    const isRead = readIds.includes(n.id);
    return (
      <div
        key={n.id}
        className={`relative group rounded-2xl p-4 transition-all border ${
          isRead
            ? 'bg-surface-container border-outline-variant/10 opacity-70'
            : 'bg-surface-container-lowest border-outline-variant/20 shadow-sm'
        }`}
      >
        {/* Unread dot */}
        {!isRead && (
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.bg}`}>
            <span className={`material-symbols-outlined text-xl ${n.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {n.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${n.bg} ${n.color}`}>
                {n.type === 'program' ? 'Program' : n.tag || 'Community'}
              </span>
              <span className="text-[10px] text-outline">{n.time}</span>
            </div>

            <p className={`text-xs font-bold leading-snug line-clamp-2 ${isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>
              {n.body}
            </p>

            {n.author && (
              <p className="text-[10px] text-outline">By {n.author}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Link
                to={n.path}
                onClick={() => { markRead(n.id); onClose(); }}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 ${
                  n.type === 'program'
                    ? 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20'
                    : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                }`}
              >
                {n.cta}
              </Link>
              {!isRead && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-[11px] text-on-surface-variant hover:text-primary transition-colors font-medium"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismissNotification(n.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-outline hover:text-error rounded-full hover:bg-error/10"
            title="Dismiss"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="md:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 md:top-4 md:right-4 md:left-auto left-0 z-[60] w-full md:w-96 max-h-[100dvh] md:max-h-[calc(100vh-2rem)] flex flex-col bg-surface-container-low md:rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-slide-in-right"
        style={{ animationDuration: '0.25s' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications
              </span>
            </div>
            <div>
              <h2 className="font-bold text-on-surface text-sm">Notifications</h2>
              <p className="text-[10px] text-on-surface-variant">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">

          {/* Programs section */}
          {programs.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-violet-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  New Programs ({programs.length})
                </span>
              </div>
              <div className="space-y-2">
                {programs.map(renderItem)}
              </div>
            </section>
          )}

          {/* Community section */}
          {community.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-rose-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  forum
                </span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Recent Discussions ({community.length})
                </span>
              </div>
              <div className="space-y-2">
                {community.map(renderItem)}
              </div>
            </section>
          )}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">notifications_none</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">All caught up!</p>
                <p className="text-xs text-on-surface-variant mt-1">No new notifications right now.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-outline-variant/20 px-5 py-3 bg-surface flex items-center justify-between">
          <Link
            to="/programs"
            onClick={onClose}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">apps</span>
            Browse Programs
          </Link>
          <Link
            to="/community"
            onClick={onClose}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">group</span>
            Community
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
