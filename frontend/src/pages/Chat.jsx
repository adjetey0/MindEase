import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

/* ── Mood detection from message text ──────────────────────── */
const detectMood = (text) => {
  const t = text.toLowerCase();
  if (/anxious|panic|worried|nervous|fear|scared/.test(t)) return { label: 'Anxious', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: 'air' };
  if (/sad|depress|lonely|cry|hopeless|lost/.test(t)) return { label: 'Sad', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: 'sentiment_dissatisfied' };
  if (/stress|overwhelm|burnout|exhaust|tired/.test(t)) return { label: 'Stressed', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: 'psychology_alt' };
  if (/happy|great|excite|amazing|joy|good/.test(t)) return { label: 'Happy', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: 'sentiment_very_satisfied' };
  if (/calm|peace|relax|better|grateful/.test(t)) return { label: 'Calm', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: 'spa' };
  return null;
};

/* ── Coping exercises per mood ─────────────────────────────── */
const copingByMood = {
  Anxious: [
    { icon: 'air', label: '4-7-8 Breathing', prompt: 'Guide me through 4-7-8 breathing to calm my anxiety.' },
    { icon: 'self_improvement', label: '5-4-3-2-1 Grounding', prompt: 'Walk me through the 5-4-3-2-1 grounding technique.' },
  ],
  Stressed: [
    { icon: 'directions_walk', label: 'Mindful Walk', prompt: 'Give me a quick mindful walking exercise for stress.' },
    { icon: 'spa', label: 'Body Scan', prompt: 'Guide me through a progressive muscle relaxation body scan.' },
  ],
  Sad: [
    { icon: 'edit_note', label: 'Gratitude Journal', prompt: 'Help me write 3 things I can feel grateful for right now.' },
    { icon: 'group', label: 'Reach Out', prompt: 'I feel lonely. Give me tips on reconnecting with others.' },
  ],
  Happy: [
    { icon: 'star', label: 'Savour Moment', prompt: 'Help me savour and record this positive moment mindfully.' },
  ],
  Calm: [
    { icon: 'menu_book', label: 'Deepen Practice', prompt: 'Suggest a mindfulness practice to deepen my calm state.' },
  ],
};

/* ── Suggested prompts pool ────────────────────────────────── */
const suggestedPrompts = [
  { icon: 'air', label: 'Breathing Exercise', text: 'Can you guide me through a 2-minute breathing exercise?' },
  { icon: 'lightbulb', label: 'Mindfulness Tip', text: 'Give me a mindfulness tip for workplace stress.' },
  { icon: 'bedtime', label: 'Sleep Help', text: 'I\'m struggling to fall asleep. What can I do?' },
  { icon: 'psychology', label: 'Manage Anxiety', text: 'How do I manage sudden anxiety in public?' },
  { icon: 'self_improvement', label: 'Morning Routine', text: 'Help me build a calming morning wellness routine.' },
  { icon: 'mood_bad', label: 'Feeling Low', text: 'I\'ve been feeling really low lately. Can we talk?' },
];

function Chat() {
  const { toggleMobileMenu } = useLayout();
  const navigate = useNavigate();
  const {
    chatMessages, sendChatMessage, clearChat, profile,
    moodLogs, logMood, assessmentProfile, hasCompletedAssessment,
  } = useData();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detected mood from latest user message
  const [detectedMood, setDetectedMood] = useState(null);
  // Mood selected in chat check-in
  const [moodSelected, setMoodSelected] = useState(null);
  // Per-message feedback { [msgId]: 'up'|'down' }
  const [feedback, setFeedback] = useState({});
  // Toast
  const [toastMsg, setToastMsg] = useState(null);
  // Show coping sidebar panel
  const [showCoping, setShowCoping] = useState(false);
  // Show history panel
  const [showHistory, setShowHistory] = useState(false);
  // Emergency banner dismissed
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  // AI tone
  const [aiTone, setAiTone] = useState('Empathetic');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading, scrollToBottom]);

  // Detect mood from latest user message
  useEffect(() => {
    const lastUser = [...chatMessages].reverse().find(m => m.sender === 'user');
    if (lastUser) {
      const mood = detectMood(lastUser.text);
      setDetectedMood(mood);
    }
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setIsLoading(true);
    sendChatMessage(text);
    setInput('');
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handlePrompt = (text) => {
    setIsLoading(true);
    sendChatMessage(text);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleMoodSelect = (mood) => {
    setMoodSelected(mood);
    logMood(mood, 'Logged via AI Chat');
    sendChatMessage(`I'm feeling ${mood.toLowerCase()} right now.`);
    showToast(`Mood "${mood}" logged to your tracker!`);
  };

  const handleFeedback = (msgId, type) => {
    setFeedback(prev => ({ ...prev, [msgId]: type }));
    showToast(type === 'up' ? 'Thanks for the feedback! 😊' : 'Got it — we\'ll improve.');
  };

  const handleNewChat = () => {
    clearChat();
    setMoodSelected(null);
    setDetectedMood(null);
    setFeedback({});
    setInput('');
    setEmergencyDismissed(false);
    setShowCoping(false);
    setShowHistory(false);
    showToast('New conversation started! 🌱');
  };

  const handleCycleTone = () => {
    const tones = ['Empathetic', 'Structured', 'Direct'];
    const next = tones[(tones.indexOf(aiTone) + 1) % tones.length];
    setAiTone(next);
    showToast(`AI tone set to ${next}`);
  };

  // Detect urgent keywords for emergency banner
  const lastUserMsg = [...chatMessages].reverse().find(m => m.sender === 'user');
  const showEmergencyBanner = !emergencyDismissed &&
    lastUserMsg &&
    /suicid|self.harm|hurt myself|end my life|crisis|can't go on/i.test(lastUserMsg.text);

  const userMessages = chatMessages.filter(m => m.sender === 'user');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="h-16 w-full flex justify-between items-center px-4 sm:px-6 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="md:hidden text-on-surface-variant p-1.5 rounded-lg hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <div>
            <h1 className="font-bold text-on-surface text-sm flex items-center gap-2">
              MindEase AI Companion
              <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{aiTone}</span>
            </h1>
            <p className="text-[11px] text-secondary flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`} />
              {isLoading ? 'Thinking…' : 'Online · Available 24/7'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Detected mood pill */}
          {detectedMood && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${detectedMood.bg} ${detectedMood.color} text-xs font-semibold border border-current/20`}>
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{detectedMood.icon}</span>
              {detectedMood.label} detected
            </div>
          )}

          {/* Coping exercises toggle */}
          <button
            onClick={() => { setShowCoping(!showCoping); setShowHistory(false); }}
            title="Coping Exercises"
            className={`p-2 rounded-xl transition-all ${showCoping ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-xl">self_improvement</span>
          </button>

          {/* History toggle */}
          <button
            onClick={() => { setShowHistory(!showHistory); setShowCoping(false); }}
            title="Chat History"
            className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-xl">history</span>
          </button>

          {/* New chat */}
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-xl">add_comment</span>
          </button>

          {/* Tone cycle */}
          <button
            onClick={handleCycleTone}
            title="Change AI Tone"
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
          </button>
        </div>
      </header>

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-sm">check_circle</span>{toastMsg}
        </div>
      )}

      {/* ── Main layout: chat + optional side panel ───────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── Chat Column ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* 🚨 Emergency Support Banner */}
          {showEmergencyBanner && (
            <div className="mx-4 mt-3 flex items-center gap-3 bg-error/10 border border-error/30 rounded-2xl px-4 py-3 shrink-0">
              <span className="material-symbols-outlined text-error text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              <div className="flex-1 min-w-0">
                <p className="text-error font-bold text-xs">Are you in crisis?</p>
                <p className="text-error/80 text-[11px]">You don't have to face this alone. Help is available right now.</p>
              </div>
              <Link to="/emergency" className="shrink-0 bg-error text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition">Get Help</Link>
              <button onClick={() => setEmergencyDismissed(true)} className="text-error/60 hover:text-error transition shrink-0">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

          {/* 📊 Assessment Reminder Banner */}
          {!hasCompletedAssessment && chatMessages.length <= 2 && (
            <div className="mx-4 mt-3 flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 shrink-0">
              <span className="material-symbols-outlined text-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <p className="flex-1 text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface">Personalize your experience.</span> Take a quick assessment to help me support you better.
              </p>
              <button onClick={() => navigate('/assessment')} className="shrink-0 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition">Start</button>
            </div>
          )}

          {/* Messages Canvas */}
          <div className="flex-1 overflow-y-auto py-4 px-3 sm:px-4 custom-scrollbar">
            <div className="max-w-[800px] mx-auto space-y-4">

              {/* Assessment context banner (first message) */}
              {assessmentProfile && chatMessages.length <= 1 && (
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <div className="max-w-[85%] bg-gradient-to-br from-primary/8 to-surface-container-lowest border border-primary/20 p-4 rounded-3xl rounded-bl-md shadow-sm">
                    <p className="text-on-surface text-sm leading-relaxed">
                      I can see you're working on <strong>{assessmentProfile.primaryGoalTitle?.toLowerCase()}</strong>.
                      {assessmentProfile.emotionalStateTitle && <> You mentioned feeling <strong>{assessmentProfile.emotionalStateTitle?.toLowerCase()}</strong> — that's completely okay.</>}
                      {' '}What's on your mind today?
                    </p>
                    <span className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>Personalized from your assessment
                    </span>
                  </div>
                </div>
              )}

              {/* 😊 Mood Check-in */}
              {!moodSelected && (
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
                  <p className="text-center text-xs text-on-surface-variant font-semibold mb-3">How are you feeling right now?</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[
                      { emoji: '😌', label: 'Calm' },
                      { emoji: '😊', label: 'Happy' },
                      { emoji: '😐', label: 'Okay' },
                      { emoji: '😓', label: 'Stressed' },
                      { emoji: '😰', label: 'Anxious' },
                    ].map((m) => (
                      <button
                        key={m.label}
                        onClick={() => handleMoodSelect(m.label)}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-2xl hover:bg-surface-container-high transition active:scale-90"
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[10px] text-on-surface-variant font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  {moodLogs[0] && (
                    <p className="text-center text-[10px] text-outline mt-3">
                      Last check-in: <span className="font-semibold text-on-surface">{moodLogs[0].emotion}</span> · {moodLogs[0].date}
                    </p>
                  )}
                </div>
              )}

              {/* 😊 Detected Mood indicator inline */}
              {detectedMood && moodSelected && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit mx-auto ${detectedMood.bg} ${detectedMood.color} border border-current/20 text-xs font-semibold`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{detectedMood.icon}</span>
                  Sensing: {detectedMood.label}
                </div>
              )}

              {/* Chat Messages */}
              {chatMessages.map((msg) =>
                msg.sender === 'bot' ? (
                  <div key={msg.id} className="flex gap-3 items-end group">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                    </div>
                    <div className="max-w-[85%] space-y-1">
                      <div className="bg-surface-container-lowest border border-outline-variant/20 p-3.5 rounded-3xl rounded-bl-md shadow-sm">
                        <p className="text-on-surface text-sm leading-relaxed">{msg.text}</p>
                        {msg.timestamp && <span className="text-[10px] text-outline block mt-1.5">{msg.timestamp}</span>}
                      </div>
                      {/* 👍 Feedback row */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded-full text-xs transition ${feedback[msg.id] === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-on-surface-variant hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: feedback[msg.id] === 'up' ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded-full text-xs transition ${feedback[msg.id] === 'down' ? 'text-rose-500 bg-rose-500/10' : 'text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10'}`}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: feedback[msg.id] === 'down' ? "'FILL' 1" : "'FILL' 0" }}>thumb_down</span>
                        </button>
                        <span className="text-[10px] text-outline/60">Helpful?</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-row-reverse gap-3 items-end">
                    <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
                    <div className="max-w-[85%] bg-primary text-white p-3.5 rounded-3xl rounded-br-md shadow-md">
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      {msg.timestamp && <span className="text-[10px] text-white/60 block mt-1.5 text-right">{msg.timestamp}</span>}
                    </div>
                  </div>
                )
              )}

              {/* ⌨️ Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/20 px-5 py-3 rounded-full shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Input Area ──────────────────────────────────── */}
          <div className="shrink-0 bg-background border-t border-outline-variant/10 px-3 sm:px-4 pt-3 pb-5">
            <div className="max-w-[800px] mx-auto space-y-3">

              {/* 💡 Suggested Prompts */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handlePrompt(p.text)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low border border-outline-variant/20 rounded-full text-on-surface-variant font-semibold text-xs hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition"
                  >
                    <span className="material-symbols-outlined text-sm">{p.icon}</span>
                    {p.label}
                  </button>
                ))}

                {/* 📍 Find Nearby Clinics shortcut */}
                <Link
                  to="/emergency#local-support"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-600 font-semibold text-xs hover:bg-rose-500/20 transition"
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Nearby Clinics
                </Link>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-2 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:outline-none text-on-surface placeholder:text-outline text-sm py-1.5 resize-none max-h-32 custom-scrollbar"
                  placeholder="Share what's on your mind..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ fieldSizing: 'content' }}
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Char count hint */}
                  {input.length > 200 && (
                    <span className={`text-[10px] font-semibold ${input.length > 500 ? 'text-error' : 'text-outline'}`}>
                      {input.length}/500
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </form>

              <p className="text-center text-[10px] text-outline">
                MindEase AI is not a substitute for professional care. In crisis?{' '}
                <Link to="/emergency" className="text-error font-bold hover:underline">Get immediate help →</Link>
              </p>
            </div>
          </div>
        </div>

        {/* ── Side Panel: Coping Exercises ───────────────────── */}
        {showCoping && (
          <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-outline-variant/20 bg-surface-container-lowest overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-sm">🌿 Coping Exercises</h3>
                <p className="text-[11px] text-on-surface-variant">Based on your mood</p>
              </div>
              <button onClick={() => setShowCoping(false)} className="text-on-surface-variant hover:text-on-surface transition">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Current mood state */}
              {detectedMood && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${detectedMood.bg} ${detectedMood.color} border border-current/20 text-xs font-semibold`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{detectedMood.icon}</span>
                  Sensing {detectedMood.label}
                </div>
              )}

              {/* Relevant exercises */}
              {Object.entries(copingByMood).map(([mood, exercises]) => (
                <div key={mood}>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">{mood}</p>
                  <div className="space-y-2">
                    {exercises.map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => { handlePrompt(ex.prompt); setShowCoping(false); }}
                        className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 hover:bg-primary/5 transition text-left group"
                      >
                        <span className="material-symbols-outlined text-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{ex.icon}</span>
                        <div>
                          <p className="font-semibold text-xs text-on-surface">{ex.label}</p>
                          <p className="text-[10px] text-on-surface-variant line-clamp-1">{ex.prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quick links */}
              <div className="pt-3 border-t border-outline-variant/10 space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quick Links</p>
                <Link to="/programs" className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-primary/5 transition text-xs font-semibold text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-base">apps</span>Browse Programs
                </Link>
                <Link to="/resources" className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low hover:bg-primary/5 transition text-xs font-semibold text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-base">menu_book</span>Resources Library
                </Link>
                <Link to="/emergency#local-support" className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition text-xs font-semibold text-rose-600">
                  <span className="material-symbols-outlined text-base">location_on</span>Find Nearby Clinics
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Side Panel: Chat History ────────────────────────── */}
        {showHistory && (
          <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-outline-variant/20 bg-surface-container-lowest overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-sm">📜 Chat History</h3>
                <p className="text-[11px] text-on-surface-variant">{userMessages.length} messages sent</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-on-surface-variant hover:text-on-surface transition">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              {userMessages.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-8">No messages yet.</p>
              ) : (
                [...userMessages].reverse().map((msg) => (
                  <div key={msg.id} className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <p className="text-xs text-on-surface line-clamp-2">{msg.text}</p>
                    <span className="text-[10px] text-outline mt-1 block">{msg.timestamp}</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-outline-variant/10">
              <button
                onClick={() => {
                  clearChat();
                  setMoodSelected(null);
                  setDetectedMood(null);
                  setFeedback({});
                  setEmergencyDismissed(false);
                  setShowHistory(false);
                  showToast('Conversation cleared!');
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-error border border-error/20 py-2.5 rounded-full hover:bg-error/10 transition"
              >
                <span className="material-symbols-outlined text-sm">delete</span>Clear Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
