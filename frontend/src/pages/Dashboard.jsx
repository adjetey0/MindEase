import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

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

/* ─── Mood config ──────────────────────────────────────────── */
const moodOptions = [
  { label: 'Happy', icon: 'sentiment_very_satisfied', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  { label: 'Calm', icon: 'spa', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  { label: 'Focused', icon: 'center_focus_strong', color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  { label: 'Tired', icon: 'bedtime', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  { label: 'Anxious', icon: 'air', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
];

const emotionChart = {
  Happy: { height: 90, color: 'bg-amber-400', emoji: '😊' },
  Calm: { height: 70, color: 'bg-emerald-500', emoji: '😌' },
  Focused: { height: 80, color: 'bg-sky-500', emoji: '🎯' },
  Anxious: { height: 30, color: 'bg-rose-400', emoji: '😰' },
  Tired: { height: 25, color: 'bg-indigo-400', emoji: '😴' },
  Stressed: { height: 30, color: 'bg-orange-400', emoji: '😓' },
  Peaceful: { height: 85, color: 'bg-teal-400', emoji: '🧘' },
  Okay: { height: 55, color: 'bg-slate-400', emoji: '😐' },
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ─── Nearby clinics mock data ─────────────────────────────── */
const nearbyClinics = [
  { id: 1, name: 'MindBridge Counseling Center', specialty: 'Anxiety & Depression', distance: '0.8 km', rating: 4.9, phone: '+1 (555) 123-4567', open: true, icon: 'psychology' },
  { id: 2, name: 'Serenity Mental Health Clinic', specialty: 'CBT & Trauma Therapy', distance: '1.4 km', rating: 4.7, phone: '+1 (555) 234-5678', open: true, icon: 'local_hospital' },
  { id: 3, name: 'Wellbeing Therapy Hub', specialty: 'Mindfulness & Stress', distance: '2.1 km', rating: 4.8, phone: '+1 (555) 345-6789', open: false, icon: 'spa' },
];

function Dashboard() {
  const { toggleMobileMenu } = useLayout();
  const { profile, moodLogs, logMood, assessmentProfile, hasCompletedAssessment, chatMessages } = useData();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodLoggedSuccess, setMoodLoggedSuccess] = useState(false);

  // Deterministic daily tip
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayTip = wellnessTips[dayOfYear % wellnessTips.length];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodLog = (mood) => {
    logMood(mood.label, '');
    setSelectedMood(mood.label);
    setMoodLoggedSuccess(true);
    setTimeout(() => { setMoodLoggedSuccess(false); setSelectedMood(null); }, 3000);
  };

  const latestAssessment = profile?.assessmentHistory?.[0] || null;
  const goalKey = assessmentProfile?.primaryGoalTitle;
  const recommendations = goalRecommendations[goalKey] || goalRecommendations.default;
  const chartLogs = [...moodLogs].slice(0, 10).reverse();
  const recentUserChats = chatMessages.filter(m => m.sender === 'user').slice(-4).reverse();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-6 border-b border-outline-variant/10 shrink-0">
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
            <span>{profile.streak} Day Streak</span>
          </div>
          <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition shrink-0">
            <img alt={profile.name} className="w-full h-full object-cover" src={profile.avatar} />
          </Link>
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="max-w-[1280px] w-full mx-auto p-4 sm:p-6 space-y-5 pb-24 md:pb-8">

          {/* 1. WELCOME MESSAGE */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">
                  {new Date().getHours() < 12 ? '🌤️' : new Date().getHours() < 18 ? '☀️' : '🌙'} {getGreeting()}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.name.split(' ')[0]} 👋</h2>
                <p className="text-white/80 text-sm mt-1.5 max-w-full">
                  {moodLoggedSuccess
                    ? '✅ Mood logged! Keep up the great work.'
                    : 'Ready to check in on your mental wellness today?'}
                </p>
              </div>
              <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{profile.streak}</div>
                  <div className="text-xs text-white/70 font-semibold">Day Streak 🔥</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{profile.totalSessions}</div>
                  <div className="text-xs text-white/70 font-semibold">Sessions Done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">

              {/* 2. TODAY'S MOOD */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span>
                      Today's Mood
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">How are you feeling right now?</p>
                  </div>
                  {moodLoggedSuccess && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
                      <span className="material-symbols-outlined text-sm">check_circle</span>Logged!
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m.label}
                      onClick={() => handleMoodLog(m)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 ${m.color} ${selectedMood === m.label ? 'ring-2 ring-primary shadow-md' : ''}`}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                      <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
                {moodLogs[0] && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/10 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">history</span>
                    Last logged: <span className="font-semibold text-on-surface">{moodLogs[0].emotion}</span>
                    {moodLogs[0].note && <span className="italic truncate">"{moodLogs[0].note}"</span>}
                    <span className="ml-auto text-outline shrink-0">{moodLogs[0].date}</span>
                  </div>
                )}
              </div>

              {/* 3. LATEST ASSESSMENT RESULT */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  Latest Assessment Result
                </h3>
                {latestAssessment ? (
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
                    {hasCompletedAssessment && assessmentProfile && (
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
                    <p className="text-sm text-on-surface-variant mb-4">No assessment taken yet. Personalize your experience in 2 minutes.</p>
                    <button
                      onClick={() => navigate('/assessment')}
                      className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition flex items-center gap-1.5 mx-auto"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>Take Assessment
                    </button>
                  </div>
                )}
              </div>

              {/* 6. MOOD TREND */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>show_chart</span>
                      Mood Trend
                    </h3>
                    <p className="text-xs text-on-surface-variant">Your last {chartLogs.length} check-ins</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>whatshot</span>
                    {profile.streak} day streak
                  </div>
                </div>
                {chartLogs.length > 0 ? (
                  <>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex items-end gap-2 h-36 min-w-[280px]">
                        {chartLogs.map((log, i) => {
                          const meta = emotionChart[log.emotion] || { height: 50, color: 'bg-primary', emoji: '🙂' };
                          const date = new Date(log.date);
                          return (
                            <div key={log.id || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 shadow-lg">
                                {log.emotion} {log.date}
                              </div>
                              <span className="text-sm opacity-60 group-hover:opacity-100 group-hover:scale-125 transition">{meta.emoji}</span>
                              <div
                                className={`w-full rounded-t-xl ${meta.color} hover:brightness-110 cursor-pointer min-w-[18px] transition-all duration-500`}
                                style={{ height: `${meta.height}%` }}
                              />
                              <span className="text-[9px] text-on-surface-variant font-semibold">{dayNames[date.getDay()]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/10 mt-2">
                      {Object.entries(emotionChart).slice(0, 6).map(([label, m]) => (
                        <div key={label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${m.color}`} />
                          <span className="text-[10px] text-on-surface-variant font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-8">Log your first mood to see the trend chart!</p>
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

              {/* 4. PERSONALIZED RECOMMENDATIONS */}
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
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] text-left ${rec.color}`}
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

              {/* 5. DAILY WELLNESS TIP */}
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

              {/* 8. FIND NEARBY CLINICS */}
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
