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
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around items-center h-20 z-50 px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;