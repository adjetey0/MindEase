import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useData } from './DataContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const STORAGE_KEY = 'mindease_notifications_v1';

export function NotificationProvider({ children }) {
  const { programs, communityPosts, profile } = useData();

  // Track which notification IDs have been read
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    } catch {}
  }, [readIds]);

  // ── Generate notifications ─────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const list = [];

    // 1. New programs user is NOT enrolled in
    const unenrolledPrograms = programs.filter((p) => !p.enrolled);
    unenrolledPrograms.forEach((p) => {
      list.push({
        id: `prog-${p.id}`,
        type: 'program',
        icon: 'school',
        color: 'text-violet-600',
        bg: 'bg-violet-500/10',
        title: 'New Program Available',
        body: `"${p.title}" — ${p.duration} · ${p.level}`,
        cta: 'Enroll Now',
        path: '/programs',
        time: 'Available now',
      });
    });

    // 2. Recent community discussions (last 4 posts)
    const recentPosts = [...communityPosts].slice(0, 4);
    recentPosts.forEach((post) => {
      list.push({
        id: `post-${post.id}`,
        type: 'community',
        icon: 'forum',
        color: 'text-rose-600',
        bg: 'bg-rose-500/10',
        title: 'Community Discussion',
        body: post.title,
        cta: 'Join Discussion',
        path: '/community',
        time: post.time,
        author: post.author,
        tag: post.tag,
      });
    });

    // Sort: unread first
    list.sort((a, b) => (readIds.includes(a.id) ? 1 : -1) - (readIds.includes(b.id) ? 1 : -1));
    return list;
  }, [programs, communityPosts, profile, readIds]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markRead = (id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  const dismissNotification = (id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, readIds, markRead, markAllRead, dismissNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
