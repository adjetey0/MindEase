import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

function Settings() {
  const { toggleMobileMenu } = useLayout();
  const { darkMode, setDarkMode } = useTheme();
  const { profile, updateProfile, settings, updateSettings, resetAllData } = useData();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const [emailNotifs, setEmailNotifs] = useState(settings.emailNotifications);
  const [dailyReminders, setDailyReminders] = useState(settings.dailyCheckinReminder);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [privacyLevel, setPrivacyLevel] = useState(settings.privacyLevel);

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    updateProfile({ name: fullName, email });
    updateSettings({
      emailNotifications: emailNotifs,
      dailyCheckinReminder: dailyReminders,
      soundEffects,
      privacyLevel
    });
    showToast('All settings saved successfully!');
  };

  const handleDiscard = () => {
    setFullName(profile.name);
    setEmail(profile.email);
    setEmailNotifs(settings.emailNotifications);
    setDailyReminders(settings.dailyCheckinReminder);
    setSoundEffects(settings.soundEffects);
    setPrivacyLevel(settings.privacyLevel);
    showToast('Changes discarded.');
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, settings }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mindease_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data exported successfully!');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-20 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">MindEase</span>
          </div>
        </div>
        <Link to="/chat" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Chat</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <section className="p-margin-mobile md:p-margin-desktop max-w-[1000px] mx-auto w-full py-8">

          {/* Page Header */}
          <header className="mb-6 md:mb-8">
            <h1 className="font-headline-xl text-[28px] sm:text-[32px] md:text-[40px] font-bold text-on-surface mb-2">
              Account Settings
            </h1>
            <p className="text-on-surface-variant text-sm">
              Manage your personal preferences, notifications, and privacy configuration.
            </p>
          </header>

          <div className="space-y-6">

            {/* Profile Section */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/20 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container p-2 rounded-xl text-secondary">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <h2 className="font-headline-md text-lg font-bold text-on-surface">Account Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Display Name</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Email Address</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Theme & Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appearance */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/20 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <span className="material-symbols-outlined text-xl">dark_mode</span>
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Appearance</h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                  <div>
                    <p className="font-bold text-sm text-on-surface">Dark Mode</p>
                    <p className="text-xs text-on-surface-variant">Switch to a dark color palette</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform mt-1 ml-1 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/20 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary-container p-2 rounded-xl text-secondary">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Notifications</h3>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <label className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl cursor-pointer">
                    <span>Daily Check-in Reminder</span>
                    <input
                      type="checkbox"
                      checked={dailyReminders}
                      onChange={(e) => setDailyReminders(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl cursor-pointer">
                    <span>Email Digest &amp; Tips</span>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/20 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-tertiary-container/30 p-2 rounded-xl text-tertiary">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Privacy &amp; Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/assessment?retake=true')}
                  className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between hover:bg-primary/10 transition text-left"
                >
                  <div>
                    <p className="font-bold text-xs text-primary">Retake Wellness Assessment</p>
                    <p className="text-[10px] text-on-surface-variant">Update your personalization profile</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                </button>

                <button
                  onClick={handleExportData}
                  className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center justify-between hover:bg-surface-container-high transition text-left"
                >
                  <div>
                    <p className="font-bold text-xs text-on-surface">Export Personal Data</p>
                    <p className="text-[10px] text-on-surface-variant">Download JSON backup of your metrics</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">download</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Reset all MindEase data to default defaults?')) {
                      resetAllData();
                      showToast('Data reset to defaults!');
                    }
                  }}
                  className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-between hover:bg-error/20 transition text-left"
                >
                  <div>
                    <p className="font-bold text-xs text-error">Reset App Storage</p>
                    <p className="text-[10px] text-on-surface-variant">Clear local storage state</p>
                  </div>
                  <span className="material-symbols-outlined text-error text-xl">restart_alt</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={handleDiscard}
                className="px-6 py-3 border border-outline-variant/30 text-on-surface-variant rounded-full font-bold text-xs hover:bg-surface-container-high transition"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-primary text-white font-bold text-xs rounded-full shadow-lg hover:opacity-90 transition"
              >
                Save All Changes
              </button>
            </div>

          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default Settings;
