import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import CallModal from "../components/Chat/CallModal";
import API_BASE from '../utils/api';

const CHAT_API_BASE = `${API_BASE}/api/chat`;

// Generate or retrieve a persistent session ID using localStorage
function getSessionId() {
  let id = localStorage.getItem('mindease_session_id');
  if (!id) {
    id = crypto.randomUUID?.() || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('mindease_session_id', id);
  }
  return id;
}

function Chat() {
  const { toggleMobileMenu } = useLayout();
  const sessionId = useRef(getSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hello! I'm here to support your mental wellbeing. It's a brand new day — how can I help you find some peace today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moodSelected, setMoodSelected] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // ── Header Icon Menus State ─────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [aiTone, setAiTone] = useState('Empathetic');
  const [toastMsg, setToastMsg] = useState(null);

  // Mock list of past session logs
  const [sessionLogs, setSessionLogs] = useState([
    { id: 'sess_today', title: "Today's Check-in", date: 'Today, 2:30 PM', preview: 'Feeling calm and productive...' },
    { id: 'sess_yesterday', title: 'Desk Decompression', date: 'Yesterday, 8:15 PM', preview: 'Guided breathing exercise completed...' },
    { id: 'sess_july20', title: 'CBT Reflection on Stress', date: 'July 20, 2026', preview: 'Discussed workplace stress...' },
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Load chat history from backend on mount ────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${CHAT_API_BASE}/history/${sessionId.current}`);
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

  // ── Auto-scroll to bottom ──────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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
        headers: { 'Content-Type': 'application/json' },
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Handle mood selection ──────────────────────────────
  const handleMoodSelect = (mood) => {
    setMoodSelected(mood);
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
  };

  const handleCycleTone = () => {
    const tones = ['Empathetic', 'Structured', 'Direct'];
    const nextTone = tones[(tones.indexOf(aiTone) + 1) % tones.length];
    setAiTone(nextTone);
    setShowMoreMenu(false);
    showToast(`AI Personality set to ${nextTone}`);
  };

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
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h2 className="text-base sm:text-headline-md font-bold text-primary flex items-center gap-1.5 sm:gap-2">
              <span>MindEase Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden xs:inline-block">
                {aiTone}
              </span>
            </h2>
            <p className="text-[11px] sm:text-[12px] text-secondary flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-secondary'} animate-pulse`}></span>
              {isLoading ? 'Thinking…' : 'AI Companion Online'}
            </p>
          </div>
        </div>

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
            </div>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Chat History Slide-Over Drawer ────────────────────────── */}
      {showHistory && (
        <div className="absolute inset-0 z-40 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-sm bg-surface h-full border-l border-outline-variant/30 shadow-2xl z-10 p-6 flex flex-col justify-between animate-slide-up">
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
                {sessionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="glass-card rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-on-surface text-sm">{log.title}</h4>
                      <span className="text-[10px] text-on-surface-variant">{log.date}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{log.preview}</p>
                  </div>
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
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

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
        </div>
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