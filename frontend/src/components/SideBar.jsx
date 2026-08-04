import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLayout } from './Layout';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useLayout();

  // Primary workspace navigation items (navbar handles Resources, Programs, Community)
  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Take Assessment', path: '/assessment', icon: 'psychology' },
    { name: 'Chat', path: '/chat', icon: 'forum' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];


  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/20 z-50 p-4 space-y-2 transition-all duration-300 ${sidebarCollapsed ? 'w-20 items-center' : 'w-64'
        }`}
    >
      {/* Header with Title and Hide/Collapse Toggle Button */}
      <div className={`flex items-center justify-between w-full mb-4 ${sidebarCollapsed ? 'px-0 py-4 flex-col gap-3' : 'px-2 py-4'}`}>
        {!sidebarCollapsed && (
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">MindEase</h1>
            <p className="font-label-md text-label-md text-on-surface-variant mt-0.5">Mental Wellbeing</p>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
        )}

        {/* Sidebar Collapse/Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Hide Sidebar'}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">
            {sidebarCollapsed ? 'side_navigation' : 'dock_to_right'}
          </span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 min-h-0 space-y-1.5 overflow-y-auto custom-scrollbar w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            title={sidebarCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `rounded-xl flex items-center transition-all active:scale-[0.98] ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${isActive
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="font-label-md text-label-md">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Navigation Items */}
      <div className="pt-3 border-t border-outline-variant/10 space-y-1.5 w-full">
        <NavLink
          to="/emergency"
          title={sidebarCollapsed ? 'Emergency Support' : undefined}
          className={({ isActive }) =>
            `w-full rounded-xl flex items-center transition-all font-semibold ${sidebarCollapsed ? 'justify-center p-3' : 'gap-2.5 px-4 py-2.5'
            } ${isActive
              ? 'bg-error text-white shadow-md shadow-error/20'
              : 'text-error border border-error/20 hover:bg-error/10'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px] fill-icon">emergency</span>
          {!sidebarCollapsed && <span className="font-label-md text-label-md">Emergency Support</span>}
        </NavLink>
        <NavLink
          to="/settings"
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `w-full rounded-xl flex items-center transition-all ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
            } ${isActive
              ? 'bg-primary-container text-on-primary-container font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          {!sidebarCollapsed && <span className="font-label-md text-label-md">Settings</span>}
        </NavLink>
        <NavLink
          to="/help"
          title={sidebarCollapsed ? 'Help' : undefined}
          className={({ isActive }) =>
            `w-full rounded-xl flex items-center transition-all ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
            } ${isActive
              ? 'bg-primary-container text-on-primary-container font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined">help</span>
          {!sidebarCollapsed && <span className="font-label-md text-label-md">Help</span>}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
