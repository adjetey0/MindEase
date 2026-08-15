import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLayout } from './Layout';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useLayout();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Chat', path: '/chat', icon: 'forum' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <>
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/20 z-50 p-4 space-y-2 overflow-hidden transition-[width] duration-150 ease-out will-change-[width] ${sidebarCollapsed ? 'w-20 items-center' : 'w-64'
          }`}
      >
        {/* Header with Title and Hide/Collapse Toggle Button */}
        <div className={`flex items-center justify-between w-full mb-4 ${sidebarCollapsed ? 'px-0 py-4 flex-col gap-3' : 'px-2 py-4'}`}>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
              <img src="/mindEaseLogo.png" alt="MindEase Logo" className="w-6 h-6 object-contain shrink-0 logo-blue" />
              <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight truncate">MindEase</h1>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center p-1">
              <img src="/mindEaseLogo.png" alt="MindEase Logo" className="w-6 h-6 object-contain logo-blue" />
            </div>
          )}

          {/* Sidebar Collapse/Expand Toggle Button */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Hide Sidebar'}
            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-xl">
              {sidebarCollapsed ? 'side_navigation' : 'dock_to_right'}
            </span>
          </button>
        </div>

        {/* Main Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar w-full">
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
                    className="material-symbols-outlined text-xl shrink-0"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="font-label-md text-label-md truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}

          {/* Notification Bell */}
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className={`w-full rounded-xl flex items-center transition-all active:scale-[0.98] relative ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${notifOpen
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
          >
            <span className="relative shrink-0">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: notifOpen ? "'FILL' 1" : "'FILL' 0" }}
              >
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            {!sidebarCollapsed && (
              <span className="font-label-md text-label-md truncate flex-1 text-left">Notifications</span>
            )}
            {!sidebarCollapsed && unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
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
            <span className="material-symbols-outlined text-[20px] fill-icon shrink-0">emergency</span>
            {!sidebarCollapsed && <span className="font-label-md text-label-md truncate">Emergency Support</span>}
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
            <span className="material-symbols-outlined shrink-0">settings</span>
            {!sidebarCollapsed && <span className="font-label-md text-label-md truncate">Settings</span>}
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
            <span className="material-symbols-outlined shrink-0">help</span>
            {!sidebarCollapsed && <span className="font-label-md text-label-md truncate">Help</span>}
          </NavLink>
        </div>
      </aside>

      {/* Notification Panel */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

export default Sidebar;