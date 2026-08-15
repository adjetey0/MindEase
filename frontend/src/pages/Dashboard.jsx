import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';
import useUserStats from '../hooks/useUserStats';
import { MOOD_OPTIONS, getWeeklyMoodView, getMoodTrendSummary, getLocalDateString } from '../services/dailyMoodService';

/* ─── Daily Wellness Tips pool ─────────────────────────────── */
const wellnessTips = [
  { icon: 'air', color: 'text-sky-500', tip: 'Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times to calm your nervous system instantly.' },
  { icon: 'bedtime', color: 'text-indigo-500', tip: 'Dim your screens 1 hour before bed. Blue light suppresses melatonin and delays deep sleep by up to 90 minutes.' },
  { icon: 'directions_walk', color: 'text-emerald-500', tip: 'A brisk 10-minute walk outdoors boosts serotonin, reduces cortisol, and clears mental fog more effectively than caffeine.' },
  { icon: 'water_drop', color: 'text-cyan-500', tip: 'Even mild dehydration (1-2%) can increase anxiety and reduce focus. Drink a full glass of water before checking your phone.' },
  { icon: 'self_improvement', color: 'text-violet-500', tip: 'Start a 5-minute gratitude journal. Writing 3 specific things you appreciate rewires your brain toward positivity over 8 weeks.' },
  { icon: 'music_note', color: 'text-rose-500', tip: 'Listening to 60 BPM music (like classical or lo-fi) synchronizes your brainwaves to a calm alpha state within minutes.' },
  { icon: 'spa', color: 'text-teal-500', tip: 'Body scan meditation before sleep: mentally relax each body part from toes to head. It reduces insomnia by 40% with daily practice.' },
];

/* ─── Personalized Recommendation map ─────────────────────── */
const goalRecommendations = {
  'Manage stress': [
    { icon: 'self_improvement', label: 'Daily Meditation', desc: '10-min mindfulness session', path: '/programs', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
    { icon: 'air', label: 'Breathwork', desc: '4-7-8 breathing technique', path: '/resources', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
    { icon: 'forum', label: 'Talk It Out', desc: 'Chat with your AI companion', path: '/chat', color: 'bg-primary/10 text-primary border-primary/20' },
  ],
  'Better sleep': [
    { icon: 'bedtime', label: 'Sleep Program', desc: 'Mindful Sleep Essentials', path: '/programs', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { icon: 'wb_sunny', label: 'Morning Light', desc: 'Sunrise routine guide', path: '/resources', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { icon: 'music_note', label: 'Sleep Sounds', desc: 'Delta frequency soundscapes', path: '/resources', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  ],
  default: [
    { icon: 'apps', label: 'Browse Programs', desc: 'Guided wellness courses', path: '/programs', color: 'bg-primary/10 text-primary border-primary/20' },
    { icon: 'menu_book', label: 'Read Articles', desc: 'Expert mental health library', path: '/resources', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { icon: 'group', label: 'Community', desc: 'Connect with others', path: '/community', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  ],
};

/* ─── Nearby clinics mock data ─────────────────────────────── */
const nearbyClinics = [
  { id: 1, name: 'MindBridge Counseling Center', specialty: 'Anxiety & Depression', distance: '0.8 km', rating: 4.9, phone: '+1 (555) 123-4567', open: true, icon: 'psychology' },
  { id: 2, name: 'Serenity Mental Health Clinic', specialty: 'CBT & Trauma Therapy', distance: '1.4 km', rating: 4.7, phone: '+1 (555) 234-5678', open: true, icon: 'local_hospital' },
  { id: 3, name: 'Wellbeing Therapy Hub', specialty: 'Mindfulness & Stress', distance: '2.1 km', rating: 4.8, phone: '+1 (555) 345-6789', open: false, icon: 'spa' },
];

function Dashboard() {
  const { toggleMobileMenu } = useLayout();
  const {
    profile,
    assessmentProfile,
    hasCompletedAssessment,
    chatMessages,
    dailyCheckins = [],
    dailyStreak = 0,
    todayCheckin = null,
    saveDailyCheckin,
    logMood,
    programs = [],
  } = useData();

  const activePrograms = (programs || []).filter((p) => p.enrolled);

  const { stats, loading, error, refreshStats, updateActivityStats } = useUserStats();
  const navigate = useNavigate();

  // Daily Mood Check-in local state
  const [selectedMood, setSelectedMood] = useState(todayCheckin ? todayCheckin.mood : null);
  const [checkinNote, setCheckinNote] = useState(todayCheckin ? (todayCheckin.note || '') : '');
  const [isEditingTodayMood, setIsEditingTodayMood] = useState(false);
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Deterministic daily tip
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayTip = wellnessTips[dayOfYear % wellnessTips.length];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = (moodLabel) => {
    setSelectedMood(moodLabel);
  };

  const handleCheckinSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedMood || isSubmittingCheckin) return;

    setIsSubmittingCheckin(true);
    try {
      await saveDailyCheckin(selectedMood, checkinNote);
      await logMood(selectedMood, checkinNote);
      await updateActivityStats('mood');
      setIsEditingTodayMood(false);
      setToastMessage("Today's check-in completed ✓");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to submit daily check-in:', err);
      const msg = err?.message || 'Could not save check-in. Please try again.';
      setToastMessage(`⚠️ ${msg}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  const latestAssessment = profile?.assessmentHistory?.[0] || null;
  const goalKey = assessmentProfile?.primaryGoalTitle;
  const recommendations = goalRecommendations[goalKey] || goalRecommendations.default;
  const recentUserChats = chatMessages.filter(m => m.sender === 'user').slice(-4).reverse();

  // Weekly mood view
  const weeklyView = getWeeklyMoodView(dailyCheckins);
  const moodTrendSummary = getMoodTrendSummary(dailyCheckins);

  // User classification
  const isNewUser = (
    stats.exercises_completed === 0 &&
    stats.programs_completed === 0 &&
    dailyCheckins.length === 0 &&
    dailyStreak === 0
  );

  // Format date helper for history list
  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const todayStr = getLocalDateString(new Date());
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayObj);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-surface/95 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="md:hidden text-on-surface-variant p-1.5 rounded-lg hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 className="font-bold text-on-surface text-base leading-tight">Dashboard</h1>
            <p className="text-xs text-on-surface-variant hidden sm:block">Your daily wellness overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold text-xs border border-amber-500/20">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <span>{dailyStreak} Day Streak</span>
          </div>
          <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 hover:opacity-90 transition shrink-0">
            <img alt={profile.name} className="w-full h-full object-cover" src={profile.avatar} />
          </Link>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar will-change-scroll">
        <div className="max-w-[1280px] w-full mx-auto p-4 sm:p-6 space-y-5 pb-24 md:pb-8">

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 w-fit mx-auto animate-fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-sm space-y-4">
              <div className="h-6 bg-outline-variant/20 rounded w-1/3" />
              <div className="h-4 bg-outline-variant/20 rounded w-2/3" />
              <div className="h-10 bg-outline-variant/20 rounded-full w-40" />
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between text-rose-700 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
              <button
                onClick={refreshStats}
                className="font-bold underline hover:opacity-80"
              >
                Retry
              </button>
            </div>
          )}

          {/* 1. WELCOME BANNER (Dynamic Streak & Checkin Status) */}
          {!loading && (
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">
                    {new Date().getHours() < 12 ? '🌤️' : new Date().getHours() < 18 ? '☀️' : '🌙'} {getGreeting()}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {isNewUser ? 'Welcome to MindEase' : `Welcome back, ${profile?.name ? profile.name.split(' ')[0] : 'there'} `}
                  </h2>
                  <p className="text-white/80 text-sm mt-1.5 max-w-full">
                    {todayCheckin
                      ? 'Today\'s check-in completed'
                      : 'Take a moment to check in on how you are feeling today.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0 flex-wrap">
                  <div className="text-center bg-white/15 px-4 py-2.5 rounded-2xl border border-white/20 min-w-[90px]">
                    <div className="text-2xl sm:text-3xl font-extrabold">🔥 {dailyStreak}</div>
                    <div className="text-[11px] text-white/80 font-semibold">Day Streak</div>
                  </div>
                  <div className="text-center bg-white/15 px-4 py-2.5 rounded-2xl border border-white/20 min-w-[90px]">
                    <div className="text-2xl sm:text-3xl font-extrabold">📝 {dailyCheckins.length}</div>
                    <div className="text-[11px] text-white/80 font-semibold">Check-ins</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasCompletedAssessment && (
            <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-indigo-500/10 rounded-3xl p-6 border border-primary/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-2xl">assignment</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">Personalize Your Wellness Journey</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Take a quick 2-minute assessment to customize your daily recommendations, CBT tools, and AI companion tone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/assessment')}
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-full hover:opacity-90 transition shadow shrink-0 flex items-center gap-2"
              >
                <span>Take Assessment</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">

              {/* 2. DAILY MOOD CHECK-IN CARD (Section 1 & 2 & 8 & 17) */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border border-outline-variant/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span>
                      Daily Mood Check-in
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {todayCheckin && !isEditingTodayMood
                        ? "Today's check-in completed ✓"
                        : "How are you feeling today?"}
                    </p>
                  </div>
                  {todayCheckin && !isEditingTodayMood && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                  )}
                </div>

                {/* State A: Already checked in today (and not currently editing) */}
                {todayCheckin && !isEditingTodayMood ? (
                  <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">
                          {MOOD_OPTIONS.find(m => m.label === todayCheckin.mood)?.emoji || '😊'}
                        </span>
                        <div>
                          <p className="text-xs text-on-surface-variant font-semibold">Today's mood</p>
                          <h4 className="text-lg font-bold text-on-surface">{todayCheckin.mood}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMood(todayCheckin.mood);
                          setCheckinNote(todayCheckin.note || '');
                          setIsEditingTodayMood(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition border border-primary/20 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit Today's Mood
                      </button>
                    </div>

                    {todayCheckin.note && (
                      <p className="text-xs text-on-surface-variant italic bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                        "{todayCheckin.note}"
                      </p>
                    )}

                    <p className="text-xs text-outline pt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Come back tomorrow for your next check-in.
                    </p>
                  </div>
                ) : (
                  /* State B: Prompt for Today's Check-in (or editing today's check-in) */
                  <form onSubmit={handleCheckinSubmit} className="space-y-4">
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {MOOD_OPTIONS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleMoodSelect(m.label)}
                          className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center gap-1 transition-colors ${selectedMood === m.label
                            ? 'ring-2 ring-primary bg-primary/10 border-primary shadow-sm'
                            : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5'
                            }`}
                        >
                          <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                          <span className="text-[10px] font-bold text-on-surface truncate w-full text-center">{m.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Optional Note Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant block">
                        Want to tell us more? <span className="text-outline font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={checkinNote}
                        onChange={(e) => setCheckinNote(e.target.value)}
                        placeholder="Add a brief note about your day..."
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={!selectedMood || isSubmittingCheckin}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition shadow disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        {isEditingTodayMood ? "Update Today's Check-in" : "Submit Today's Check-in"}
                      </button>
                      {isEditingTodayMood && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTodayMood(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-full transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
              {/* 3. WEEKLY MOOD VIEW & TRENDS (Section 11 & 12) */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border border-outline-variant/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_view_week</span>
                      This Week's Mood View
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Your daily mood reflection for this week</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    {dailyStreak} Day Streak
                  </div>
                </div>

                {/* Mon - Sun Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center pt-2">
                  {weeklyView.map((item) => (
                    <div
                      key={item.dayLabel}
                      className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-between gap-1 transition-all ${item.isToday
                        ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                        : item.checkin
                          ? 'bg-surface-container-low border-outline-variant/20'
                          : 'bg-surface-container-lowest border-dashed border-outline-variant/30 opacity-70'
                        }`}
                    >
                      <span className="text-[10px] font-bold text-on-surface-variant">{item.dayLabel}</span>
                      <span className="text-xl sm:text-2xl my-1">
                        {item.emoji ? item.emoji : '—'}
                      </span>
                      <span className="text-[9px] text-outline truncate max-w-full font-medium">
                        {item.moodLabel ? item.moodLabel : (item.isFuture ? 'Upcoming' : 'No entry')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Non-Diagnostic Trend Observation */}
                <div className="bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/10 flex items-center gap-2.5 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base shrink-0">insights</span>
                  <span>{moodTrendSummary}</span>
                </div>
              </div>

              {/* 4. RECENT MOOD HISTORY (Section 10) */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                    Recent Mood History
                  </h3>
                  <span className="text-xs font-semibold text-outline">
                    {dailyCheckins.length} check-in{dailyCheckins.length === 1 ? '' : 's'} total
                  </span>
                </div>

                {dailyCheckins.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-2xl space-y-1">
                    <span className="material-symbols-outlined text-3xl text-outline block">history_toggle_off</span>
                    <p className="text-xs font-semibold text-on-surface-variant">No check-ins yet</p>
                    <p className="text-[11px] text-outline">Complete your first daily check-in above to build your mood history.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {dailyCheckins.slice(0, 5).map((checkin) => {
                      const moodObj = MOOD_OPTIONS.find(m => m.label === checkin.mood) || { emoji: '🙂', color: 'bg-primary/10 text-primary' };
                      return (
                        <div
                          key={checkin.id || checkin.check_in_date}
                          className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:border-outline-variant/30 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0">{moodObj.emoji}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-on-surface leading-tight">{checkin.mood}</p>
                              {checkin.note && (
                                <p className="text-[11px] text-on-surface-variant truncate max-w-[200px] sm:max-w-[300px]">
                                  "{checkin.note}"
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-outline shrink-0 ml-2">
                            {formatHistoryDate(checkin.check_in_date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. LATEST ASSESSMENT RESULT */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  {hasCompletedAssessment && latestAssessment ? "Latest Assessment Result" : "Complete your wellness assessment"}
                </h3>
                {hasCompletedAssessment && latestAssessment ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Score ring */}
                      <div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-outline-variant/20" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className="text-primary"
                            strokeDasharray={`${Math.max(0, 100 - (latestAssessment.score / 21) * 100)} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold text-on-surface">{latestAssessment.score}</span>
                          <span className="text-[10px] text-on-surface-variant font-semibold">/21</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-2">
                          <span className="material-symbols-outlined text-xs">bar_chart</span>
                          {latestAssessment.level}
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{latestAssessment.recommendation}</p>
                        <p className="text-xs text-outline mt-1.5">Taken on {latestAssessment.date}</p>
                      </div>
                    </div>
                    {assessmentProfile && (
                      <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 text-xs text-on-surface-variant space-y-1">
                        <p>Goal: <span className="font-semibold text-on-surface">{assessmentProfile.primaryGoalTitle}</span></p>
                        {assessmentProfile.emotionalStateTitle && <p>Feeling: <span className="font-semibold text-on-surface">{assessmentProfile.emotionalStateTitle}</span></p>}
                        {assessmentProfile.supportPreferenceTitle && <p>Prefers: <span className="font-semibold text-on-surface">{assessmentProfile.supportPreferenceTitle}</span></p>}
                      </div>
                    )}
                    <button
                      onClick={() => navigate('/assessment?retake=true')}
                      className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/10 transition flex items-center gap-1.5 w-fit"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>Retake Assessment
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">quiz</span>
                    <p className="text-sm text-on-surface-variant mb-4">Complete your 2-minute wellness assessment to unlock personalized recommendations.</p>
                    <button
                      onClick={() => navigate('/assessment')}
                      className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition flex items-center gap-1.5 mx-auto"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>Take Assessment
                    </button>
                  </div>
                )}
              </div>

              {/* 6. MY PROGRAMS */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    My Programs
                  </h3>
                  <Link to="/programs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    {activePrograms.length > 0 ? "View All" : "Explore Programs"} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>

                {activePrograms.length > 0 ? (
                  <div className="space-y-3">
                    {activePrograms.map((prog) => {
                      const isDone = prog.status === 'completed' || prog.progress === 100;
                      return (
                        <div key={prog.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">{prog.category}</span>
                            <span className="text-xs font-semibold text-on-surface-variant">{prog.progress}%</span>
                          </div>
                          <h4 className="font-bold text-sm text-on-surface">{prog.title}</h4>
                          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${prog.progress}%` }} />
                          </div>
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-on-surface-variant font-medium">
                              {isDone ? "✓ Completed" : `Day ${prog.currentActivity || 1} of ${prog.modules?.length || 7}`}
                            </span>
                            <button
                              onClick={() => navigate('/programs')}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-[11px] hover:opacity-90 transition active:scale-95 shadow-sm"
                            >
                              {isDone ? "Review" : "Continue Program"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-2xl space-y-2">
                    <span className="material-symbols-outlined text-3xl text-outline block" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    <p className="text-xs font-semibold text-on-surface-variant">You haven't enrolled in a program yet.</p>
                    <button
                      onClick={() => navigate('/programs')}
                      className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:opacity-90 transition shadow-sm inline-flex items-center gap-1 mt-1"
                    >
                      <span className="material-symbols-outlined text-sm">search</span>
                      Explore Programs
                    </button>
                  </div>
                )}
              </div>

              {/* 7. RECENT CHATS */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                    Recent Chats
                  </h3>
                  <Link to="/chat" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Open Chat <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                {recentUserChats.length > 0 ? (
                  <div className="space-y-2">
                    {recentUserChats.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                        <img src={profile.avatar} alt={profile.name} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface leading-snug line-clamp-2">{msg.text}</p>
                          <p className="text-[10px] text-outline mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2 block">chat_bubble</span>
                    <p className="text-sm text-on-surface-variant mb-3">No chats yet. Start a conversation with your AI companion.</p>
                    <button onClick={() => navigate('/chat')} className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition flex items-center gap-1.5 mx-auto">
                      <span className="material-symbols-outlined text-sm">forum</span>Start Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">

              {/* 7. DASHBOARD STREAK CARD (Section 9 & 16) */}
              <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-amber-600/10 rounded-3xl p-5 border border-amber-500/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    Daily Streak
                  </span>
                  {dailyStreak >= 3 && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center gap-1">
                      <span>🔥</span> {dailyStreak >= 30 ? '30-Day Legend' : dailyStreak >= 14 ? '14-Day Master' : dailyStreak >= 7 ? '7-Day Champion' : '3-Day Streak'}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-on-surface">🔥 {dailyStreak}</span>
                  <span className="text-sm font-semibold text-on-surface-variant">days</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {dailyStreak > 0
                    ? 'Keep checking in every day to build your emotional resilience!'
                    : 'Take a moment to check in today to start your daily streak!'}
                </p>
                {/* Milestone indicators */}
                <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 text-[10px] font-semibold text-amber-700">
                  <span className={dailyStreak >= 3 ? 'text-amber-600 font-extrabold' : 'opacity-40'}>3 Days</span>
                  <span className={dailyStreak >= 7 ? 'text-amber-600 font-extrabold' : 'opacity-40'}>7 Days</span>
                  <span className={dailyStreak >= 14 ? 'text-amber-600 font-extrabold' : 'opacity-40'}>14 Days</span>
                  <span className={dailyStreak >= 30 ? 'text-amber-600 font-extrabold' : 'opacity-40'}>30 Days</span>
                </div>
              </div>

              {/* 8. PERSONALIZED RECOMMENDATIONS */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                  Personalized For You
                </h3>
                {assessmentProfile?.primaryGoalTitle && (
                  <p className="text-xs text-on-surface-variant mb-3">Based on goal: <span className="font-semibold text-on-surface">{assessmentProfile.primaryGoalTitle}</span></p>
                )}
                <div className="space-y-2.5">
                  {recommendations.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(rec.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-colors hover:opacity-90 text-left ${rec.color}`}
                    >
                      <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{rec.icon}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm leading-tight">{rec.label}</p>
                        <p className="text-[11px] opacity-70 truncate">{rec.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm ml-auto shrink-0 opacity-60">arrow_forward_ios</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 9. DAILY WELLNESS TIP */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 rounded-3xl p-5 border border-emerald-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <span className={`material-symbols-outlined text-xl ${todayTip.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{todayTip.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Daily Wellness Tip</p>
                    <p className="text-[10px] text-on-surface-variant">Refreshes every day</p>
                  </div>
                </div>
                <p className="text-sm text-on-surface leading-relaxed">{todayTip.tip}</p>
              </div>

              {/* 10. FIND NEARBY CLINICS */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    Nearby Clinics
                  </h3>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full border border-outline-variant/10">Your area</span>
                </div>
                <div className="space-y-3">
                  {nearbyClinics.map((clinic) => (
                    <div key={clinic.id} className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex gap-3">
                      <div className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{clinic.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-semibold text-on-surface text-xs leading-tight line-clamp-1">{clinic.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${clinic.open ? 'bg-emerald-500/10 text-emerald-600' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                            {clinic.open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{clinic.specialty}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-amber-500 font-bold">&#9733; {clinic.rating}</span>
                          <span className="text-[10px] text-outline">{clinic.distance}</span>
                        </div>
                        <a href={`tel:${clinic.phone}`} className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline">
                          <span className="material-symbols-outlined text-xs">call</span>{clinic.phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/emergency#local-support"
                  className="w-full mt-3 text-xs font-bold text-primary border border-primary/30 py-2.5 rounded-full hover:bg-primary/10 transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">search</span>Search More Clinics
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => navigate('/chat')}
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition"
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
      </button>
    </div>
  );
}

export default Dashboard;
