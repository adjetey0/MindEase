import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

function Dashboard() {
  const { toggleMobileMenu } = useLayout();
  const { profile, programs, moodLogs, logMood } = useData();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodLoggedSuccess, setMoodLoggedSuccess] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activePrograms = programs.filter((p) => p.enrolled);

  const handleQuickMoodLog = (emotion) => {
    logMood(emotion, moodNote);
    setSelectedMood(emotion);
    setMoodLoggedSuccess(true);
    setTimeout(() => {
      setMoodLoggedSuccess(false);
      setSelectedMood(null);
      setMoodNote('');
    }, 3000);
  };

  const moodOptions = [
    { label: 'Calm', icon: 'spa', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    { label: 'Happy', icon: 'sentiment_very_satisfied', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    { label: 'Anxious', icon: 'air', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
    { label: 'Tired', icon: 'bedtime', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
    { label: 'Focused', icon: 'center_focus_strong', color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header / Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 glass-nav h-20 flex items-center justify-between px-margin-mobile md:px-margin-desktop border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              {getGreeting()}, {profile.name.split(' ')[0]}
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant">Here is your daily wellness dashboard.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold text-xs border border-amber-500/20">
            <span className="material-symbols-outlined text-base">local_fire_department</span>
            <span>{profile.streak} Day Streak</span>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition">
            <img alt={profile.name} className="w-full h-full object-cover" src={profile.avatar} />
          </Link>
        </div>
      </header>

      {/* Page Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto p-margin-mobile md:p-lg space-y-md flex-grow">

          {/* Daily Quick Mood Check-in */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-md border border-outline-variant/10 card-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Daily Mood Check-in</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">How are you feeling right now?</p>
              </div>
              {moodLoggedSuccess && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Logged to your profile! (+1 Streak)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {moodOptions.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleQuickMoodLog(m.label)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 ${m.color} ${
                    selectedMood === m.label ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{m.icon}</span>
                  <span className="font-label-md text-label-md font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Streak Chart */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-md border border-outline-variant/10 card-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  Daily Streak Tracker
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Your mood check-in history over the last 14 days</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>whatshot</span>
                <span className="font-bold text-lg">{profile.streak}</span>
                <span className="text-xs font-semibold">day streak</span>
              </div>
            </div>

            {(() => {
              const emotionMap = {
                'Calm': { height: 70, color: 'bg-emerald-500', emoji: '😌' },
                'Happy': { height: 90, color: 'bg-amber-400', emoji: '😊' },
                'Focused': { height: 80, color: 'bg-sky-500', emoji: '🎯' },
                'Anxious': { height: 40, color: 'bg-rose-400', emoji: '😰' },
                'Tired': { height: 30, color: 'bg-indigo-400', emoji: '😴' },
                'Stressed': { height: 35, color: 'bg-orange-400', emoji: '😓' },
                'Peaceful': { height: 85, color: 'bg-teal-400', emoji: '🧘' },
                'Okay': { height: 55, color: 'bg-slate-400', emoji: '😐' },
              };
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const chartLogs = [...moodLogs].slice(0, 14).reverse();

              return (
                <div className="space-y-4">
                  <div className="flex items-end gap-1.5 sm:gap-2 h-40 sm:h-48 px-2">
                    {chartLogs.map((log, i) => {
                      const meta = emotionMap[log.emotion] || { height: 50, color: 'bg-primary', emoji: '🙂' };
                      const date = new Date(log.date);
                      const dayLabel = dayNames[date.getDay()];
                      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

                      return (
                        <div key={log.id || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            {log.emotion} • {log.date}
                            {log.note && <span className="block text-[9px] opacity-70 mt-0.5">"{log.note}"</span>}
                          </div>
                          <span className="text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity">{meta.emoji}</span>
                          <div
                            className={`w-full rounded-t-lg ${meta.color} transition-all duration-500 hover:opacity-80 cursor-pointer min-w-[14px]`}
                            style={{ height: `${meta.height}%`, animationDelay: `${i * 60}ms` }}
                          />
                          <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-semibold">{dayLabel}</span>
                          <span className="text-[8px] text-outline hidden sm:block">{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2 border-t border-outline-variant/10 justify-center">
                    {Object.entries(emotionMap).slice(0, 6).map(([label, meta]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                        <span className="text-[10px] font-semibold text-on-surface-variant">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bento Grid Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-md border border-outline-variant/10 card-shadow flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">My Active Programs</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {activePrograms.length} active program{activePrograms.length !== 1 ? 's' : ''} in progress
                  </p>
                </div>
                <Link to="/programs" className="text-primary font-semibold text-sm hover:underline">
                  Browse All
                </Link>
              </div>

              {activePrograms.length > 0 ? (
                <div className="space-y-4">
                  {activePrograms.map((program) => (
                    <div key={program.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-md font-semibold text-on-surface">{program.title}</span>
                        <span className="font-label-md font-bold text-primary">{program.progress}%</span>
                      </div>
                      <div className="w-full bg-outline-variant/20 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${program.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        Instructor: {program.instructor} • {program.modules.filter(m => m.completed).length}/{program.modules.length} modules completed
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant text-sm mb-4">You have not enrolled in any programs yet.</p>
                  <Link to="/programs" className="bg-primary text-white text-xs px-5 py-2.5 rounded-full font-semibold">
                    Explore Programs
                  </Link>
                </div>
              )}
            </div>

            <div className="md:col-span-4 flex flex-col gap-gutter">
              <div className="flex-1 bg-secondary-container/20 rounded-[2rem] p-md border border-secondary/10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">local_fire_department</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold text-on-secondary-container">{profile.streak} Days</h4>
                <p className="font-label-md text-label-md text-on-secondary-fixed-variant">Active Wellness Streak</p>
              </div>

              <div className="flex-1 bg-tertiary-container/10 rounded-[2rem] p-md border border-tertiary/10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">task_alt</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold text-tertiary">{profile.totalSessions}</h4>
                <p className="font-label-md text-label-md text-on-tertiary-fixed-variant">Total Sessions Completed</p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            <button
              onClick={() => navigate('/chat')}
              className="group bg-primary text-on-primary rounded-[2rem] p-md flex flex-col h-full text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <div className="w-12 h-12 bg-on-primary/10 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-on-primary text-2xl">forum</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold mb-2">AI Mental Companion</h3>
              <p className="font-body-md text-body-md text-on-primary/80 mb-6">Talk through your thoughts in a safe, confidential space 24/7.</p>
              <div className="mt-auto flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider font-bold">
                Start Conversation <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/assessment')}
              className="group bg-surface-container-highest rounded-[2rem] p-md flex flex-col h-full text-left border border-outline-variant/10 transition-all hover:border-primary/30 active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">Take Assessment</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Evaluate your current anxiety and stress levels with instant feedback.</p>
              <div className="mt-auto flex items-center gap-2 font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                Begin Quiz <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">play_arrow</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="group bg-surface-container-lowest rounded-[2rem] p-md flex flex-col h-full text-left border border-outline-variant/10 transition-all hover:border-primary/30 active:scale-[0.98] card-shadow"
            >
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">Clinical Resources</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Explore our curated library of mental health articles and guided videos.</p>
              <div className="mt-auto flex items-center gap-2 font-label-md text-label-md text-secondary font-bold uppercase tracking-wider">
                Explore Library <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">open_in_new</span>
              </div>
            </button>
          </div>

          {/* Recent Mood Logs History */}
          {moodLogs.length > 0 && (
            <div className="bg-surface-container-lowest rounded-[2rem] p-md border border-outline-variant/10 card-shadow">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">Recent Mood Entries</h3>
              <div className="divide-y divide-outline-variant/10">
                {moodLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-semibold text-on-surface">{log.emotion}</span>
                      {log.note && <span className="text-on-surface-variant italic">"{log.note}"</span>}
                    </div>
                    <span className="text-xs text-outline">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FAB (Mobile only for Quick Chat) */}
      <button
        onClick={() => navigate('/chat')}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
      </button>
    </div>
  );
}

export default Dashboard;