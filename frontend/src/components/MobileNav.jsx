import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

function MobileNav() {
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Programs', path: '/programs', icon: 'apps' },
    { name: 'Chat', path: '/chat', icon: 'forum' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/85 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around items-center h-16 sm:h-20 z-50 px-1 sm:px-4 shadow-lg transition-colors">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-90 ${
                isActive ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-xl sm:text-2xl transition-all duration-300"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Notification Bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300 active:scale-90 relative ${
            notifOpen ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="relative">
            <span
              className="material-symbols-outlined text-xl sm:text-2xl transition-all duration-300"
              style={{ fontVariationSettings: notifOpen ? "'FILL' 1" : "'FILL' 0" }}
            >
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-error text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-tight">Alerts</span>
        </button>
      </nav>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

export default MobileNav;

