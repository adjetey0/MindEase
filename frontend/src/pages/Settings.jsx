import React, { useState, useEffect, useRef } from 'react';
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

  // Delete Account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1 = warning, 2 = type DELETE
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInputRef = useRef(null);

  // Focus the DELETE input when step 2 is shown
  useEffect(() => {
    if (deleteStep === 2 && deleteInputRef.current) {
      deleteInputRef.current.focus();
    }
  }, [deleteStep]);

  // Reset modal state when closed
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    // Delay reset so the closing animation completes
    setTimeout(() => {
      setDeleteStep(1);
      setDeleteConfirmText('');
      setIsDeleting(false);
    }, 200);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    // Simulate a brief processing delay for UX
    setTimeout(() => {
      resetAllData();
      localStorage.clear();
      navigate('/');
    }, 1500);
  };

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

            {/* ─── Danger Zone ─── */}
            <div className="relative mt-4 rounded-[2rem] border-2 border-red-500/30 bg-gradient-to-br from-red-500/[0.04] to-red-900/[0.06] p-6 space-y-5 overflow-hidden">
              {/* Decorative corner glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

              {/* Section header */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-red-500/15 p-2.5 rounded-xl text-red-500">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-red-500">Danger Zone</h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Irreversible actions — proceed with extreme caution.</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-red-500/15" />

              {/* Delete Account card */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-lowest/80 backdrop-blur border border-red-500/20">
                <div className="space-y-1">
                  <p className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">person_remove</span>
                    Delete Account
                  </p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-full">
                    Permanently delete your MindEase account and erase all associated data including mood logs, chat history, program progress, and community posts. This action cannot be undone.
                  </p>
                </div>
                <button
                  id="delete-account-trigger"
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0 group relative px-6 py-3 rounded-xl font-bold text-xs text-red-500 border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 active:scale-[0.97]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">delete_forever</span>
                    Delete My Account
                  </span>
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ─── Delete Account Confirmation Modal ─── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) closeDeleteModal(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

          {/* Modal */}
          <div className="relative w-full max-w-[500px] bg-surface rounded-[2rem] shadow-2xl border border-outline-variant/20 overflow-hidden animate-[scaleIn_0.25s_ease-out]">
            {/* Red accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />

            {/* Modal content */}
            <div className="p-6 sm:p-8">

              {/* Step 1: Warning */}
              {deleteStep === 1 && (
                <div className="space-y-5">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h2 className="font-headline-md text-xl font-bold text-on-surface">Delete Your Account?</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      This is a permanent action that <strong className="text-red-500">cannot be reversed</strong>. Please review what will be lost:
                    </p>
                  </div>

                  {/* Consequences list */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-red-500/5 border border-red-500/15">
                    {[
                      { icon: 'mood', label: 'All mood logs & tracking history' },
                      { icon: 'chat_bubble', label: 'Complete chat conversation history' },
                      { icon: 'school', label: 'Program progress & earned badges' },
                      { icon: 'groups', label: 'Community posts & interactions' },
                      { icon: 'settings', label: 'Account preferences & saved data' },
                    ].map((item) => (
                      <div key={item.icon} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-red-400 text-lg shrink-0">{item.icon}</span>
                        <span className="text-on-surface-variant text-xs font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <button
                      onClick={closeDeleteModal}
                      className="flex-1 px-5 py-3 rounded-xl font-bold text-xs text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition"
                    >
                      Cancel — Keep My Account
                    </button>
                    <button
                      onClick={() => setDeleteStep(2)}
                      className="flex-1 px-5 py-3 rounded-xl font-bold text-xs text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                      Continue with Deletion
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Type DELETE to confirm */}
              {deleteStep === 2 && (
                <div className="space-y-5">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h2 className="font-headline-md text-xl font-bold text-on-surface">Final Confirmation</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      To confirm deletion, type <strong className="font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">DELETE</strong> in the field below.
                    </p>
                  </div>

                  {/* Confirmation input */}
                  <div className="space-y-2">
                    <label htmlFor="delete-confirm-input" className="text-xs font-bold text-on-surface-variant block">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      ref={deleteInputRef}
                      id="delete-confirm-input"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                      placeholder="Type DELETE here..."
                      disabled={isDeleting}
                      autoComplete="off"
                      spellCheck="false"
                      className={`w-full px-4 py-3.5 rounded-xl text-sm font-mono font-bold tracking-widest text-center border-2 transition-all duration-200 focus:outline-none ${deleteConfirmText === 'DELETE'
                        ? 'border-red-500 bg-red-500/5 text-red-500 ring-4 ring-red-500/10'
                        : 'border-outline-variant/30 bg-surface-container-low text-on-surface focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10'
                        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE' && (
                      <p className="text-[11px] text-red-400 text-center font-medium animate-[fadeIn_0.15s_ease-out]">
                        Please type the exact word "DELETE" to continue.
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => { setDeleteStep(1); setDeleteConfirmText(''); }}
                      disabled={isDeleting}
                      className="flex-1 px-5 py-3 rounded-xl font-bold text-xs text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition disabled:opacity-50"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Go Back
                      </span>
                    </button>
                    <button
                      id="delete-account-confirm"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                      className={`flex-1 px-5 py-3 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 ${deleteConfirmText === 'DELETE' && !isDeleting
                        ? 'text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 active:scale-[0.98] cursor-pointer'
                        : 'text-on-surface-variant/40 bg-surface-container-low border border-outline-variant/20 cursor-not-allowed'
                        }`}
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Deleting Account…</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">delete_forever</span>
                          <span>Permanently Delete Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Keyframe animations for modal */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Settings;
