import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

function Chat() {
  const { toggleMobileMenu } = useLayout();
  const { chatMessages, sendChatMessage, profile, moodLogs, logMood, assessmentProfile } = useData();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moodSelected, setMoodSelected] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [aiTone, setAiTone] = useState('Empathetic');
  const [toastMsg, setToastMsg] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          name: file.name,
          previewUrl: event.target?.result,
          isImage: true,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment({
        name: file.name,
        previewUrl: null,
        isImage: false,
      });
    }
    e.target.value = '';
  };

  const removeAttachment = () => setAttachment(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const textToSend = input.trim() || (attachment ? `[Attached File: ${attachment.name}]` : '');
    if (!textToSend) return;

    setIsLoading(true);
    sendChatMessage(textToSend);
    setInput('');
    setAttachment(null);

    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMoodSelect = (mood) => {
    setMoodSelected(mood);
    logMood(mood, 'Logged via AI Chat');
    sendChatMessage(`I'm feeling ${mood.toLowerCase()} right now.`);
    showToast(`Logged '${mood}' to your daily mood tracker!`);
  };

  const handleQuickAction = (action) => {
    sendChatMessage(action);
  };

  const handleCycleTone = () => {
    const tones = ['Empathetic', 'Structured', 'Direct'];
    const nextTone = tones[(tones.indexOf(aiTone) + 1) % tones.length];
    setAiTone(nextTone);
    setShowMoreMenu(false);
    showToast(`AI Personality set to ${nextTone}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* Top App Bar Context */}
      <header className="h-20 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0 z-20 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h2 className="text-base sm:text-headline-md font-bold text-primary flex items-center gap-1.5 sm:gap-2">
              <span>MindEase AI Companion</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden xs:inline-block">
                {aiTone}
              </span>
            </h2>
            <p className="text-[11px] sm:text-[12px] text-secondary flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`}></span>
              {isLoading ? 'Thinking…' : 'AI Companion Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className="p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-14 w-60 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl py-2 z-50 animate-slide-up">
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
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Chat Messages Canvas */}
      <div className="flex-1 overflow-y-auto py-lg px-margin-mobile md:px-0 custom-scrollbar">
        <div className="max-w-[1100px] mx-auto space-y-md p-5">
          
          {/* Assessment-Based Personalization Context Banner */}
          {assessmentProfile && chatMessages.length <= 1 && (
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary-container text-md" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <div className="max-w-[85%] bg-gradient-to-br from-primary/8 via-surface-container-lowest to-primary/5 border border-primary/20 p-4 rounded-[1.25rem] rounded-bl-[4px] shadow-sm space-y-2">
                <p className="text-on-surface leading-relaxed text-sm">
                  I can see you're working on <strong>{assessmentProfile.primaryGoalTitle?.toLowerCase()}</strong>.
                  {assessmentProfile.emotionalStateTitle && (
                    <> You mentioned feeling <strong>{assessmentProfile.emotionalStateTitle?.toLowerCase()}</strong> recently — that's completely okay.</>
                  )}
                  {assessmentProfile.supportPreferenceTitle && (
                    <> I'll tailor our conversations around <strong>{assessmentProfile.supportPreferenceTitle?.toLowerCase()}</strong>, just as you preferred.
                    </>
                  )}
                  {' '}What's on your mind today?
                </p>
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Personalized from your assessment
                </span>
              </div>
            </div>
          )}

          {/* Daily Quick Mood Check-in Pill */}
          {!moodSelected && (
            <section className="glass-panel rounded-3xl p-md mb-lg shadow-sm">
              <p className="text-center font-label-md text-label-md text-on-surface-variant mb-4">How are you feeling right now?</p>
              <div className="flex justify-between items-center max-w-sm mx-auto">
                {[
                  { emoji: '😌', label: 'Calm' },
                  { emoji: '😐', label: 'Okay' },
                  { emoji: '😓', label: 'Stressed' },
                  { emoji: '😰', label: 'Anxious' },
                ].map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(mood.label)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-surface-container-high transition-all"
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs text-on-surface-variant font-semibold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Messages */}
          {chatMessages.map((msg) =>
            msg.sender === 'bot' ? (
              <div key={msg.id} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary-container text-md" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                </div>
                <div className="max-w-[85%] bg-surface-container-lowest border border-outline-variant/30 p-md rounded-[1.25rem] rounded-bl-[4px] shadow-sm space-y-2">
                  <p className="text-on-surface leading-relaxed text-sm">{msg.text}</p>
                  {msg.timestamp && <span className="text-[10px] text-outline block">{msg.timestamp}</span>}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-row-reverse gap-4 items-start">
                <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                <div className="max-w-[85%] bg-primary text-white p-md rounded-[1.25rem] rounded-br-[4px] shadow-md space-y-2">
                  <p className="leading-relaxed text-sm">{msg.text}</p>
                  {msg.timestamp && <span className="text-[10px] text-white/70 block text-right">{msg.timestamp}</span>}
                </div>
              </div>
            )
          )}

          {isLoading && (
            <div className="flex gap-4 items-center pb-8">
              <div className="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-md" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/30 px-6 py-4 rounded-full shadow-sm text-xs font-semibold text-on-surface-variant animate-pulse">
                MindEase is writing a thoughtful reply...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-background pt-3 pb-6 px-margin-mobile md:px-0 border-t border-outline-variant/10">
        <div className="max-w-[720px] mx-auto space-y-3">

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => handleQuickAction('Can you guide me through a 2-minute breathing exercise?')}
              className="flex-shrink-0 px-4 py-2 bg-surface-container-low border border-primary/20 rounded-full text-primary font-bold text-xs hover:bg-primary/10 transition"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">air</span>
              Breathing Exercise
            </button>
            <button
              onClick={() => handleQuickAction('Give me a mindfulness tip for workplace stress.')}
              className="flex-shrink-0 px-4 py-2 bg-surface-container-low border border-secondary/20 rounded-full text-secondary font-bold text-xs hover:bg-secondary/10 transition"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">lightbulb</span>
              Mindfulness Tip
            </button>
          </div>

          {attachment && (
            <div className="flex items-center gap-3 bg-surface border border-outline-variant/50 px-4 py-2 rounded-2xl w-fit text-xs">
              <span className="material-symbols-outlined text-primary">description</span>
              <span className="font-bold text-on-surface truncate max-w-[200px]">{attachment.name}</span>
              <button type="button" onClick={removeAttachment} className="text-on-surface-variant hover:text-error">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

          <form onSubmit={handleSubmit} className="relative glass-panel rounded-full p-2 border border-outline-variant/40 shadow-md bg-surface-container-lowest flex items-center px-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition"
            >
              add_circle
            </button>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none focus:outline-none text-on-surface placeholder:text-outline text-sm py-2.5 px-4"
              placeholder="Type your message or thought here..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              disabled={!input.trim() && !attachment}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow hover:opacity-90 transition disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
