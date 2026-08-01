import React from 'react';
import { NavLink } from 'react-router-dom';

function MobileNav() {
  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Programs', path: '/programs', icon: 'apps' },
    { name: 'Chat', path: '/chat', icon: 'forum' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/85 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around items-center h-16 sm:h-20 z-50 px-2 sm:px-4 shadow-lg transition-colors">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 active:scale-90 ${
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
              <span className="text-[10px] sm:text-xs font-semibold tracking-tight">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
