import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import CallModal from "../components/Chat/CallModal";
import API_BASE from '../utils/api';

const CHAT_API_BASE = `${API_BASE}/api/chat`;

// Every chat endpoint now requires the user's login token
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generate or retrieve a persistent session ID using localStorage
function getSessionId() {
  let id = localStorage.getItem('mindease_session_id');
  if (!id) {
    id = crypto.randomUUID?.() || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('mindease_session_id', id);
  }
  return id;
}

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
<<<<<<< HEAD
  const navigate = useNavigate();
  const {
    chatMessages, sendChatMessage, clearChat, profile,
    moodLogs, logMood, assessmentProfile, hasCompletedAssessment,
  } = useData();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
=======
  const sessionId = useRef(getSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hello! I'm here to support your mental wellbeing. It's a brand new day — how can I help you find some peace today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD

  // Detected mood from latest user message
  const [detectedMood, setDetectedMood] = useState(null);
  // Mood selected in chat check-in
  const [moodSelected, setMoodSelected] = useState(null);
  // Per-message feedback { [msgId]: 'up'|'down' }
  const [feedback, setFeedback] = useState({});
  // Toast
=======
  const [moodSelected, setMoodSelected] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // ── Header Icon Menus State ─────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [aiTone, setAiTone] = useState('Empathetic');
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
  const [toastMsg, setToastMsg] = useState(null);
  // Show coping sidebar panel
  const [showCoping, setShowCoping] = useState(false);
  // Show history panel
  const [showHistory, setShowHistory] = useState(false);
  // Emergency banner dismissed
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  // AI tone
  const [aiTone, setAiTone] = useState('Empathetic');

  // Real session list, fetched from the backend when the drawer opens
  const [sessionLogs, setSessionLogs] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Load chat history from backend on mount ────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${CHAT_API_BASE}/history/${sessionId.current}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const loaded = data.messages.map((msg) => ({
            id: msg._id,
            role: msg.sender,
            text: msg.content,
            emotion: msg.emotion || null,
          }));
          setMessages(loaded);
          setMoodSelected(true);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, []);

  // ── Fetch the real session list when the drawer opens ──
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch(`${CHAT_API_BASE}/sessions`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setSessionLogs(data.sessions || []);
    } catch (err) {
      console.error('Failed to load session list:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchSessions();
    }
  }, [showHistory, fetchSessions]);

  // ── Load a past session's real messages into the chat ──
  const loadSession = async (clickedSessionId) => {
    setLoadingSessionId(clickedSessionId);
    try {
      const res = await fetch(`${CHAT_API_BASE}/history/${clickedSessionId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      sessionId.current = clickedSessionId;
      localStorage.setItem('mindease_session_id', clickedSessionId);

      const loaded = (data.messages || []).map((msg) => ({
        id: msg._id,
        role: msg.sender,
        text: msg.content,
        emotion: msg.emotion || null,
      }));

      setMessages(
        loaded.length > 0
          ? loaded
          : [{ id: 'welcome', role: 'bot', text: "This session is empty. What's on your mind?" }]
      );
      setMoodSelected(true);
      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      showToast("Couldn't load that session. Please try again.");
    } finally {
      setLoadingSessionId(null);
    }
  };

  // ── Auto-scroll to bottom ──────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

<<<<<<< HEAD
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
=======
  // ── Handle file selection ──────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          file,
          name: file.name,
          previewUrl: event.target?.result,
          isImage: true,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment({
        file,
        name: file.name,
        previewUrl: null,
        isImage: false,
      });
    }

    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  // ── Send message to backend ────────────────────────────
  const sendMessage = async (text, fileAttachment = null) => {
    const trimmed = text.trim();
    if ((!trimmed && !fileAttachment) || isLoading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed || (fileAttachment ? `Sent an attachment: ${fileAttachment.name}` : ''),
      attachment: fileAttachment ? { ...fileAttachment } : null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${CHAT_API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: trimmed || `[Attached file: ${fileAttachment?.name}]`,
          language: 'en',
        }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();

      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        text: data.bot_message?.content || data.reply || data.response || data.message || "I'm here for you. Could you tell me more?",
        exercise: data.bot_message?.strategy || data.exercise || null,
        emotion: data.emotion || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat API error:', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'bot',
        text: "I'm sorry, I wasn't able to connect right now. Please check your connection and try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Handle form submission ─────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input, attachment);
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handlePrompt = (text) => {
    setIsLoading(true);
    sendChatMessage(text);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // ── Handle mood selection ──────────────────────────────
  const handleMoodSelect = (mood) => {
    setMoodSelected(mood);
<<<<<<< HEAD
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
=======
    sendMessage(`I'm feeling ${mood.toLowerCase()} right now.`);
  };

  // ── Handle quick action chip ───────────────────────────
  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  // ── Action Handlers for More Menu ──────────────────────
  const handleClearChat = () => {
    localStorage.removeItem('mindease_session_id');
    sessionId.current = getSessionId();

    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: "Chat cleared! How can I support you right now?",
      },
    ]);
    setMoodSelected(false);
    setShowMoreMenu(false);
    showToast('Chat history cleared.');
  };

  const handleExportChat = () => {
    const textData = messages
      .map((m) => `[${m.role.toUpperCase()}]: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindEase_Chat_Log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
    showToast('Exported chat history to file!');
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
  };

  const handleCycleTone = () => {
    const tones = ['Empathetic', 'Structured', 'Direct'];
    const next = tones[(tones.indexOf(aiTone) + 1) % tones.length];
    setAiTone(next);
    showToast(`AI tone set to ${next}`);
  };

<<<<<<< HEAD
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
=======
  const handleStartNewChat = () => {
    localStorage.removeItem('mindease_session_id');
    sessionId.current = getSessionId();

    setMessages([
      {
        id: 'welcome_new',
        role: 'bot',
        text: "Started a fresh conversation session. What's on your mind?",
      },
    ]);
    setMoodSelected(false);
    setShowHistory(false);
    showToast('Started new chat session!');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* TopAppBar Context */}
      <header className="h-20 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0 z-20 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <div>
<<<<<<< HEAD
            <h1 className="font-bold text-on-surface text-sm flex items-center gap-2">
              MindEase AI Companion
              <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{aiTone}</span>
            </h1>
            <p className="text-[11px] text-secondary flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`} />
              {isLoading ? 'Thinking…' : 'Online · Available 24/7'}
=======
            <h2 className="text-base sm:text-headline-md font-bold text-primary flex items-center gap-1.5 sm:gap-2">
              <span>MindEase Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden xs:inline-block">
                {aiTone}
              </span>
            </h2>
            <p className="text-[11px] sm:text-[12px] text-secondary flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-secondary'} animate-pulse`}></span>
              {isLoading ? 'Thinking…' : 'AI Companion Online'}
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-1.5">
          {/* Detected mood pill */}
          {detectedMood && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${detectedMood.bg} ${detectedMood.color} text-xs font-semibold border border-current/20`}>
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{detectedMood.icon}</span>
              {detectedMood.label} detected
=======
        <div className="flex items-center gap-2 relative">
          {/* History Icon Button */}
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowMoreMenu(false);
            }}
            title="Chat History Log"
            className={`p-2.5 rounded-full transition-colors ${
              showHistory ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-xl">history</span>
          </button>

          {/* More Icon Button */}
          <button
            onClick={() => {
              setShowMoreMenu(!showMoreMenu);
              setShowHistory(false);
            }}
            title="More Options"
            className={`p-2.5 rounded-full transition-colors ${
              showMoreMenu ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>

          {/* ── More Options Dropdown Menu ───────────────────── */}
          {showMoreMenu && (
            <div className="absolute right-0 top-14 w-60 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl py-2 z-50 animate-slide-up">
              <button
                onClick={handleClearChat}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary">delete_sweep</span>
                <span>Clear Current Chat</span>
              </button>
              <button
                onClick={handleExportChat}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary">download</span>
                <span>Export Chat Log (.txt)</span>
              </button>
              <button
                onClick={handleCycleTone}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-secondary">tune</span>
                <span>AI Tone: <strong>{aiTone}</strong></span>
              </button>
              <div className="my-1 border-t border-outline-variant/20" />
              <Link
                to="/emergency"
                onClick={() => setShowMoreMenu(false)}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error/10 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-base fill-icon">emergency</span>
                <span>Emergency Crisis Support</span>
              </Link>
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
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
<<<<<<< HEAD
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
=======
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Chat History Slide-Over Drawer ────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setShowHistory(false)} />
          <div
            className="fixed inset-y-0 right-0 bg-surface border-l border-outline-variant/30 shadow-2xl z-10 p-6 flex flex-col justify-between animate-slide-up overflow-y-auto"
            style={{ width: '100%', maxWidth: '384px' }}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <span className="material-symbols-outlined">history</span>
                  <span>Chat Session Logs</span>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Start New Session */}
              <button
                onClick={handleStartNewChat}
                className="w-full bg-primary text-white py-3 rounded-2xl text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Start New Session</span>
              </button>

              {/* Past Sessions List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recent Sessions</p>

                {sessionsLoading && (
                  <p className="text-xs text-on-surface-variant">Loading your sessions...</p>
                )}

                {!sessionsLoading && sessionLogs.length === 0 && (
                  <p className="text-xs text-on-surface-variant">No past sessions yet.</p>
                )}

                {sessionLogs.map((log) => (
                  <button
                    key={log.session_id}
                    onClick={() => loadSession(log.session_id)}
                    disabled={loadingSessionId === log.session_id}
                    className="w-full text-left glass-card rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/40 cursor-pointer transition-all space-y-1 disabled:opacity-60"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-on-surface text-sm">{log.title}</h4>
                      <span className="text-[10px] text-on-surface-variant">
                        {loadingSessionId === log.session_id ? 'Loading...' : log.date}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{log.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 text-center">
              <p className="text-[11px] text-on-surface-variant">Your sessions are saved privately to your account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Canvas — scrollable area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-lg px-margin-mobile md:px-0 custom-scrollbar">
        <div className="max-w-[1100px] mx-auto space-y-md p-5">
          {/* Mood Check-in Component */}
          {!moodSelected && (
            <section className="glass-panel rounded-3xl p-md mb-lg shadow-sm animate-slide-up">
              <p className="text-center font-label-md text-label-md text-on-surface-variant mb-4">How are you feeling right now?</p>
              <div className="flex justify-between items-center max-w-sm mx-auto">
                {[
                  { emoji: '😌', label: 'Calm', hoverBg: 'hover:bg-secondary-container' },
                  { emoji: '😐', label: 'Okay', hoverBg: 'hover:bg-surface-container-high' },
                  { emoji: '😓', label: 'Stressed', hoverBg: 'hover:bg-orange-100' },
                  { emoji: '😰', label: 'Anxious', hoverBg: 'hover:bg-red-100' },
                ].map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood.label)}
                    className={`flex flex-col items-center gap-2 group p-2 rounded-xl ${mood.hoverBg} transition-all active:scale-95`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{mood.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Messages */}
          {messages.map((msg) =>
            msg.role === 'bot' ? (
              <div key={msg.id} className="flex gap-4 items-start animate-slide-up">
                <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary-container text-md" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div className={`max-w-[85%] ${msg.isError ? 'bg-error-container border border-error/20' : 'bg-white border border-outline-variant/30'} p-md rounded-[1.25rem] rounded-bl-[4px] shadow-[0_20px_40px_-15px_rgba(0,89,186,0.04)] space-y-md`}>
                  <p className={`${msg.isError ? 'text-on-error-container' : 'text-on-surface'} leading-relaxed`}>{msg.text}</p>

                  {msg.exercise && (
                    <div className="bg-surface-container-low rounded-xl p-4 border-l-4 border-secondary">
                      <h4 className="font-bold text-on-surface text-label-md mb-1">Recommended Exercise</h4>
                      <p className="text-body-md text-on-surface-variant">{msg.exercise}</p>
                      <button className="mt-3 px-4 py-2 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm hover:opacity-90 transition-all active:scale-95">Start Exercise</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-row-reverse gap-4 items-start animate-slide-up">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex-shrink-0 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary-fixed text-md fill-icon">person</span>
                </div>
                <div className="max-w-[85%] bg-primary text-on-primary p-md rounded-[1.25rem] rounded-br-[4px] shadow-lg shadow-primary/10 space-y-2">
                  {msg.attachment && (
                    <div className="mb-2">
                      {msg.attachment.isImage ? (
                        <img
                          src={msg.attachment.previewUrl}
                          alt={msg.attachment.name}
                          className="max-w-xs max-h-60 rounded-xl object-cover border border-white/20 shadow-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/20 text-xs">
                          <span className="material-symbols-outlined text-lg">description</span>
                          <span className="font-medium truncate max-w-[200px]">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                </div>
              </div>
            )
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4 items-center pb-8 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary-container text-md" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="bg-white border border-outline-variant/30 px-6 py-4 rounded-full shadow-sm">
                <div className="dot-flashing"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Interaction Area */}
      <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-6 px-margin-mobile md:px-0">
        <div className="max-w-[720px] mx-auto space-y-3">
          {/* Quick Actions chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => handleQuickAction('Can you guide me through a breathing exercise?')}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-2 glass-panel border border-primary/20 rounded-full text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">air</span>
              Breathing Exercise
            </button>
            <button
              onClick={() => handleQuickAction('Give me a mindfulness tip for today.')}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-2 glass-panel border border-secondary/20 rounded-full text-secondary font-label-md text-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              Mindfulness Tip
            </button>
            <button
              onClick={() => handleQuickAction('Help me with a CBT reflection exercise.')}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-2 glass-panel border border-tertiary/20 rounded-full text-tertiary font-label-md text-label-md hover:bg-tertiary-container hover:text-on-tertiary-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
              CBT Reflection
            </button>
            <button
              onClick={() => setShowCallModal(true)}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-2 glass-panel border border-error/20 rounded-full text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Talk to Someone
            </button>
          </div>

          {/* Attachment Preview Box */}
          {attachment && (
            <div className="flex items-center gap-3 bg-surface border border-outline-variant/50 px-4 py-2 rounded-2xl w-fit animate-fade-in shadow-sm">
              {attachment.isImage ? (
                <img src={attachment.previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">description</span>
                </div>
              )}
              <div className="text-xs">
                <p className="font-semibold text-on-surface truncate max-w-[200px]">{attachment.name}</p>
                <p className="text-[10px] text-on-surface-variant">Ready to upload</p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="text-on-surface-variant hover:text-error transition-colors p-1"
              >
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

<<<<<<< HEAD
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
=======
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />

          {/* Message Input Form */}
          <form onSubmit={handleSubmit} className="relative glass-panel rounded-full p-2 border border-outline-variant/50 shadow-lg shadow-primary/5 group focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-surface">
            <div className="flex items-center px-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Upload image or document"
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
              >
                add_circle
              </button>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-on-surface placeholder:text-outline font-body-md py-3 px-4"
                placeholder={attachment ? "Add a message or send attachment..." : "Tell me what's on your mind..."}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors mr-3">mic</button>
              <button
                type="submit"
                disabled={(!input.trim() && !attachment) || isLoading}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:shadow-primary/30 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-outline mt-3 px-12">
            MindEase AI provides emotional support but is not a replacement for clinical therapy.
            Your conversations are private and securely stored.
          </p>
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
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

      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          sessionId={sessionId.current}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
}

export default Chat;