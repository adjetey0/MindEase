
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useLayout } from "../components/Layout";
import { useData } from "../context/DataContext";
import BreathingTimer from "../components/BreathingTimer";
import { ARTICLES } from "../data/articlesData";

// ─── Breathing exercises data ───────────────────────────────────────────────
const BREATHING_EXERCISES = {
  b1: {
    id: "b1", name: "Box Breathing", description: "A powerful stress-relief technique used by Navy SEALs. Equal counts of inhale, hold, exhale, and hold.",
    phases: [
      { label: "Inhale", duration: 4, color: "#7c3aed" },
      { label: "Hold", duration: 4, color: "#a855f7" },
      { label: "Exhale", duration: 4, color: "#6d28d9" },
      { label: "Hold", duration: 4, color: "#a855f7" },
    ],
  },
  b2: {
    id: "b2", name: "4-7-8 Breathing", description: "Dr. Andrew Weil's natural tranquilliser for the nervous system. Promotes deep relaxation and sleep.",
    phases: [
      { label: "Inhale", duration: 4, color: "#0ea5e9" },
      { label: "Hold", duration: 7, color: "#38bdf8" },
      { label: "Exhale", duration: 8, color: "#0284c7" },
    ],
  },
  b3: {
    id: "b3", name: "Diaphragmatic Breathing", description: "Belly breathing that activates the parasympathetic nervous system, reducing cortisol and heart rate.",
    phases: [
      { label: "Inhale (belly)", duration: 5, color: "#10b981" },
      { label: "Exhale (belly)", duration: 6, color: "#059669" },
    ],
  },
  b4: {
    id: "b4", name: "Coherent Breathing", description: "Breathing at 5 breaths per minute (6 seconds in, 6 seconds out) maximises heart rate variability and calm.",
    phases: [
      { label: "Inhale", duration: 6, color: "#f59e0b" },
      { label: "Exhale", duration: 6, color: "#d97706" },
    ],
  },
};

// ─── Activity type config ─────────────────────────────────────────────────
const ACTIVITY_TYPE = {
  article: { icon: "article", label: "Article", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200" },
  breathing: { icon: "air", label: "Breathing", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-200" },
  mindfulness: { icon: "self_improvement", label: "Mindfulness", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200" },
  exercise: { icon: "fitness_center", label: "Exercise", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200" },
};

// ─── Mood options ────────────────────────────────────────────────────────────
const MOODS = [
  { id: "awful", emoji: "😞", label: "Awful" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "great", emoji: "😊", label: "Great" },
  { id: "amazing", emoji: "😄", label: "Amazing" },
];

// ─── Category filter options ─────────────────────────────────────────────────
const CATEGORIES = ["All Programs", "Anxiety", "Sleep", "Stress", "CBT", "Mindfulness"];

// ─── Mindfulness session scripts ─────────────────────────────────────────────
const MINDFULNESS_SCRIPTS = {
  default: [
    { time: 0, text: "Find a comfortable position. Close your eyes or soften your gaze downward." },
    { time: 15, text: "Take a slow, deep breath in through your nose... and gently exhale through your mouth." },
    { time: 30, text: "Notice the natural rhythm of your breathing. You don't need to change it — just observe." },
    { time: 45, text: "If your mind wanders, that's perfectly okay. Simply notice the thought and return to your breath." },
    { time: 60, text: "Now bring awareness to your body. Notice where you feel tension and breathe into those areas." },
    { time: 80, text: "With each exhale, allow any tension to melt away. You are safe, present, and at ease." },
    { time: 100, text: "Take a final deep breath in... hold gently... and release completely. Well done." },
  ],
};

// ─── Exercise instructions ───────────────────────────────────────────────────
const EXERCISE_INSTRUCTIONS = {
  104: { title: "Exposure Ladder", steps: ["List 5 situations you avoid due to anxiety, ranked from least to most frightening.", "Start with the least frightening item. Rate your anxiety (0-10) BEFORE exposure.", "Stay in the situation until your anxiety reduces by at least 50%.", "Rate your anxiety AFTER. Write down what you learned.", "Repeat daily, moving up the ladder only when you feel ready (anxiety below 3/10)."] },
  302: { title: "Psychological Boundary Setting", steps: ["Identify one relationship where you feel your boundaries are violated.", "Write down what behaviour you will no longer accept and why.", "Practise saying your boundary statement out loud: 'When you ____, I feel ____, and I need ____.'", "Plan your response if the boundary is crossed (e.g., leave the situation, repeat the boundary calmly).", "Remind yourself: boundaries are not punishments — they are acts of self-respect."] },
  402: { title: "Behavioural Activation", steps: ["List 5 activities you used to enjoy but have been avoiding.", "Schedule ONE activity for today or tomorrow. Keep it small and achievable.", "Rate your mood before the activity (0-10).", "Do the activity — even if motivation is low. Action creates motivation.", "Rate your mood after. Write down any pleasant sensations or thoughts you noticed."] },
  504: { title: "Stress Journalling", steps: ["At the top of a page, write today's biggest stressor in one sentence.", "Write for 10 minutes without stopping: What am I thinking? What am I feeling? Where do I feel it in my body?", "Circle the feelings you wrote down. Are they facts or interpretations?", "Write one thing you CAN control about this situation.", "End with a brief gratitude statement: 'One thing I am grateful for today is...'"] },
  606: { title: "Mindful Walking", steps: ["Find a quiet space to walk (indoors or outdoors) for 15-20 minutes.", "Begin walking slowly. Focus entirely on the physical sensation of your feet meeting the ground.", "Synchronise your breath with your steps: 4 steps inhale, 4 steps exhale.", "If your mind wanders, gently return attention to the sensation of walking.", "At the end, stand still for 30 seconds. Notice how your body feels after mindful movement."] },
  705: { title: "Thought Record Worksheet", steps: ["Identify a moment today when you felt anxious or upset. Write the Situation: Who? What? Where? When?", "Write your Automatic Thought: What went through your mind? (e.g., 'I always mess things up')", "Rate your belief in the thought (0-100%) and identify the emotion and its intensity (0-100%).", "Identify cognitive distortions: All-or-nothing? Catastrophising? Mind-reading? Overgeneralising?", "Write a Balanced Alternative Thought. Re-rate your emotion. Notice any shift."] },
  default: { title: "Reflection Exercise", steps: ["Find a quiet space and take three slow breaths.", "Reflect on what you have learned in this module.", "Write one insight you want to carry forward.", "Identify one specific action you will take this week.", "Share your commitment with someone you trust or write it in your journal."] },
};

// ─── Helper: get recommendation ──────────────────────────────────────────────
function getRecommendedProgram(programs, assessmentProfile) {
  if (!assessmentProfile) return null;
  const keys = [
    assessmentProfile.primaryGoal,
    assessmentProfile.emotionalState,
    assessmentProfile.sleepQuality,
    assessmentProfile.supportPreference,
  ].filter(Boolean);
  let best = null, bestScore = 0;
  for (const p of programs) {
    if (!p.recommendedFor) continue;
    const score = p.recommendedFor.filter((r) => keys.includes(r)).length;
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return best;
}

// ─── MoodPicker component ────────────────────────────────────────────────────
function MoodPicker({ phase, onSelect, onSkip }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onSkip} />
      <div className="relative w-full max-w-xl md:max-w-2xl bg-surface rounded-3xl p-6 md:p-8 shadow-2xl animate-[slideUp_0.3s_ease-out] flex flex-col items-center text-center z-10 border border-outline-variant/20">
        <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mb-4" />
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
          {phase === "before" ? "How are you feeling before starting?" : "How do you feel after completing this?"}
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          {phase === "before" ? "Tracking your mood helps measure your progress." : "Notice any shift in how you feel."}
        </p>

        {/* 5-column grid stretching full width */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full mb-6">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all active:scale-95 group w-full"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{m.emoji}</span>
              <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">{m.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onSkip}
          className="w-full py-2.5 text-sm font-bold text-on-surface-variant hover:text-primary transition rounded-xl hover:bg-surface-container-high"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ module, programId, onStart, onToggleComplete, onSetReminder, logActivityMood }) {
  const [showReminderInput, setShowReminderInput] = useState(false);
  const type = ACTIVITY_TYPE[module.type] || ACTIVITY_TYPE.article;
  const moodBefore = module.moodBefore ? MOODS.find((m) => m.id === module.moodBefore) : null;
  const moodAfter = module.moodAfter ? MOODS.find((m) => m.id === module.moodAfter) : null;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${module.completed ? "bg-surface-container/40 border-outline-variant/10 opacity-80" : "bg-surface border-outline-variant/20 hover:border-primary/30 hover:shadow-sm"}`}>
      <div className="flex items-start gap-3">
        {/* Completion toggle */}
        <button
          onClick={() => onToggleComplete(programId, module.id)}
          className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${module.completed ? "bg-primary border-primary text-white" : "border-outline-variant hover:border-primary"}`}
        >
          {module.completed && <span className="material-symbols-outlined text-xs">check</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${type.bg} ${type.color} border ${type.border}`}>
              <span className="material-symbols-outlined text-[12px]">{type.icon}</span>
              {type.label}
            </span>
            <span className={`text-sm font-semibold ${module.completed ? "line-through text-outline" : "text-on-surface"}`}>{module.title}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {module.duration}
            </span>
            {moodBefore && <span title="Mood before">{moodBefore.emoji} Before</span>}
            {moodAfter && <span title="Mood after">{moodAfter.emoji} After</span>}
            {module.reminder && (
              <span className="flex items-center gap-0.5 text-primary">
                <span className="material-symbols-outlined text-[13px]">notifications</span>
                {module.reminder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Reminder bell */}
          <button
            onClick={() => setShowReminderInput((s) => !s)}
            title="Set reminder"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition"
          >
            <span className="material-symbols-outlined text-base">{module.reminder ? "notifications_active" : "notifications"}</span>
          </button>
          {/* Start / launch */}
          {!module.completed && (
            <button
              onClick={() => onStart(module)}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition active:scale-95"
            >
              Start
            </button>
          )}
        </div>
      </div>

      {/* Reminder time input */}
      {showReminderInput && (
        <div className="mt-3 ml-9 flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Daily at:</span>
          <input
            type="time"
            defaultValue={module.reminder || "08:00"}
            onChange={(e) => onSetReminder(programId, module.id, e.target.value)}
            className="text-xs border border-outline-variant rounded-lg px-2 py-1 bg-surface focus:outline-none focus:border-primary"
          />
          <button onClick={() => setShowReminderInput(false)} className="text-xs text-primary font-bold">Save</button>
        </div>
      )}
    </div>
  );
}

// ─── Program Detail Drawer ────────────────────────────────────────────────────
function ProgramDetail({ program, onClose, onStart, toggleModuleCompletion, logActivityMood, setActivityReminder }) {
  const completed = program.modules.filter((m) => m.completed).length;
  const total = program.modules.length;
  const nextModule = program.modules.find((m) => !m.completed);
  const weeklyDone = Math.min(completed, 7);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-surface max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
        {/* Header image */}
        <div className="relative h-52 flex-shrink-0">
          <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[11px] font-bold">{program.category}</span>
            <h2 className="text-white font-bold text-xl mt-1 leading-tight">{program.title}</h2>
            <p className="text-white/70 text-xs mt-0.5">by {program.instructor} · {program.duration} · {program.level}</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Progress summary */}
          <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-on-surface">Progress</span>
              <span className="text-primary">{program.progress}%</span>
            </div>
            <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${program.progress}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{completed}</p>
                <p className="text-[10px] text-on-surface-variant">Completed</p>
              </div>
              <div className="text-center border-x border-outline-variant/20">
                <p className="text-2xl font-bold text-on-surface">{total - completed}</p>
                <p className="text-[10px] text-on-surface-variant">Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-on-surface">{total}</p>
                <p className="text-[10px] text-on-surface-variant">Total</p>
              </div>
            </div>
            {/* Weekly activity bar chart */}
            <div>
              <p className="text-[10px] text-on-surface-variant mb-1.5 font-bold uppercase tracking-wider">Weekly Activity</p>
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`flex-1 rounded-sm transition-all ${i < weeklyDone ? "bg-primary" : "bg-surface-container-high"}`}
                    style={{ height: i < weeklyDone ? `${40 + (i % 3) * 20}%` : "20%" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-on-surface-variant leading-relaxed">{program.description}</p>

          {/* Continue button */}
          {nextModule && (
            <button
              onClick={() => onStart(nextModule)}
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Continue: {nextModule.title}
            </button>
          )}
          {!nextModule && (
            <div className="w-full py-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-500/20">
              <span className="material-symbols-outlined">check_circle</span>
              Program Complete! Great work!
            </div>
          )}

          {/* Activity list */}
          <div className="space-y-3">
            <h3 className="font-bold text-on-surface">Activities ({total})</h3>
            {program.modules.map((m) => (
              <ActivityItem
                key={m.id}
                module={m}
                programId={program.id}
                onStart={onStart}
                onToggleComplete={toggleModuleCompletion}
                onSetReminder={setActivityReminder}
                logActivityMood={logActivityMood}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Modal ───────────────────────────────────────────────────────────
function ActivityModal({ module, onClose }) {
  const exercise = module.breathingId ? BREATHING_EXERCISES[module.breathingId] : null;
  const article = module.articleId ? ARTICLES.find((a) => a.id === module.articleId) : null;
  const exercInstr = EXERCISE_INSTRUCTIONS[module.id] || EXERCISE_INSTRUCTIONS.default;
  const [mindIdx, setMindIdx] = useState(0);
  const [mindRunning, setMindRunning] = useState(false);
  const [mindSeconds, setMindSeconds] = useState(0);
  const mindRef = useRef(null);
  const script = MINDFULNESS_SCRIPTS.default;

  useEffect(() => {
    if (!mindRunning) return;
    mindRef.current = setInterval(() => {
      setMindSeconds((s) => {
        const next = s + 1;
        const nextEvt = script.findIndex((e) => e.time === next);
        if (nextEvt !== -1) setMindIdx(nextEvt);
        if (next >= 110) { clearInterval(mindRef.current); setMindRunning(false); }
        return next;
      });
    }, 1000);
    return () => clearInterval(mindRef.current);
  }, [mindRunning]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between ${module.type === "breathing" ? "bg-violet-600" :
          module.type === "mindfulness" ? "bg-emerald-600" :
            module.type === "exercise" ? "bg-orange-500" : "bg-primary"
          }`}>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">
              {ACTIVITY_TYPE[module.type]?.label || "Activity"}
            </p>
            <h3 className="text-white font-bold text-lg">{module.title}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Breathing */}
          {module.type === "breathing" && exercise && (
            <div>
              <p className="text-on-surface-variant text-sm mb-4">{exercise.description}</p>
              <BreathingTimer exercise={exercise} />
            </div>
          )}

          {/* Mindfulness */}
          {module.type === "mindfulness" && (
            <div className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 min-h-[100px] flex items-center justify-center text-center">
                <p className="text-emerald-800 dark:text-emerald-300 text-base font-medium leading-relaxed transition-all duration-700">
                  {script[mindIdx].text}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-on-surface-variant">
                <span>{Math.floor(mindSeconds / 60)}:{String(mindSeconds % 60).padStart(2, "0")} / 1:50</span>
                <span>{mindIdx + 1} / {script.length}</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(mindSeconds / 110) * 100}%` }} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMindRunning((r) => !r)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition active:scale-95"
                >
                  <span className="material-symbols-outlined">{mindRunning ? "pause" : "play_arrow"}</span>
                  {mindRunning ? "Pause" : "Begin Session"}
                </button>
                <button
                  onClick={() => { setMindRunning(false); setMindSeconds(0); setMindIdx(0); }}
                  className="px-4 py-3 bg-surface-container-high rounded-2xl font-bold hover:bg-surface-container-highest transition"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant text-center">Find a quiet, comfortable space before starting.</p>
            </div>
          )}

          {/* Article */}
          {module.type === "article" && (
            <div>
              {article ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{article.category}</span>
                    <span className="text-xs text-on-surface-variant">{article.readTime}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg">{article.title}</h3>
                  <div className="prose prose-sm md:prose-base text-on-surface-variant leading-relaxed space-y-4 text-sm md:text-base">
                    {article.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant italic">{article.disclaimer}</p>
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">Article content not available.</p>
              )}
            </div>
          )}

          {/* Exercise */}
          {module.type === "exercise" && (
            <div className="space-y-4">
              <h3 className="font-bold text-on-surface">{exercInstr.title}</h3>
              <ol className="space-y-3">
                {exercInstr.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3">
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Take your time with each step. There is no rush — progress over perfection.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Programs Page ──────────────────────────────────────────────────────
function Programs() {
  const { toggleMobileMenu } = useLayout();
  const {
    programs, toggleEnrollProgram, toggleModuleCompletion,
    logActivityMood, setActivityReminder, profile, assessmentProfile,
  } = useData();

  const [activeCategory, setActiveCategory] = useState("All Programs");
  const [detailProgram, setDetailProgram] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // { module }
  const [moodPicker, setMoodPicker] = useState(null); // { programId, moduleId, phase }
  const [pendingModule, setPendingModule] = useState(null); // module waiting for after-mood

  const activePrograms = programs.filter((p) => p.enrolled);
  const filteredPrograms = programs.filter((p) =>
    activeCategory === "All Programs" || p.category.toLowerCase() === activeCategory.toLowerCase()
  );
  const recommendedProg = getRecommendedProgram(programs, assessmentProfile);
  const totalDone = programs.reduce((s, p) => s + p.modules.filter((m) => m.completed).length, 0);
  const totalModules = programs.reduce((s, p) => s + p.modules.length, 0);

  // Sync detailProgram with live data (so progress updates reflect)
  const liveDetailProg = detailProgram ? programs.find((p) => p.id === detailProgram.id) : null;

  // Handle "Start" an activity — show before-mood first
  const handleStart = (module) => {
    const prog = programs.find((p) => p.modules.some((m) => m.id === module.id));
    if (prog) {
      setPendingModule(module);
      setMoodPicker({ programId: prog.id, moduleId: module.id, phase: "before" });
    }
  };

  const handleMoodSelect = (mood) => {
    if (moodPicker) {
      logActivityMood(moodPicker.programId, moodPicker.moduleId, moodPicker.phase, mood);
      if (moodPicker.phase === "before") {
        // Open the activity modal
        setMoodPicker(null);
        setActiveModal({ module: pendingModule });
      } else {
        setMoodPicker(null);
        setPendingModule(null);
      }
    }
  };

  const handleMoodSkip = () => {
    if (moodPicker?.phase === "before") {
      setMoodPicker(null);
      setActiveModal({ module: pendingModule });
    } else {
      setMoodPicker(null);
      setPendingModule(null);
    }
  };

  const handleCloseModal = () => {
    // When activity modal closes, prompt after-mood
    const module = activeModal?.module;
    setActiveModal(null);
    if (module) {
      const prog = programs.find((p) => p.modules.some((m) => m.id === module.id));
      if (prog) {
        setPendingModule(module);
        setMoodPicker({ programId: prog.id, moduleId: module.id, phase: "after" });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Wellness Programs</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 mr-8">
            <Link to="/resources" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Resources</Link>
            <Link to="/programs" className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md">Programs</Link>
            <Link to="/community" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Community</Link>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition">
            <img className="w-full h-full object-cover" src={profile.avatar} alt={profile.name} />
          </Link>
        </div>
      </header>

      {/* Scrollable page body */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-xl flex-grow">

          {/* ── Overall Progress Stats ─────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "menu_book", label: "Activities Done", value: totalDone, color: "text-primary" },
              { icon: "stacked_bar_chart", label: "Activities Total", value: totalModules, color: "text-secondary" },
              { icon: "school", label: "Programs Enrolled", value: activePrograms.length, color: "text-tertiary" },
              { icon: "local_fire_department", label: "Day Streak", value: `${profile.streak}d`, color: "text-amber-500" },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${s.color}`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xl font-bold text-on-surface">{s.value}</p>
                  <p className="text-[11px] text-on-surface-variant">{s.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── Personalized Recommendation ───────────────────────── */}
          {assessmentProfile && recommendedProg && !recommendedProg.enrolled && (
            <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-10 -left-4 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-white/80 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider">AI Recommendation</span>
                  </div>
                  <h2 className="text-white font-bold text-xl mb-1">
                    Based on your assessment, try:
                  </h2>
                  <p className="text-white/90 text-lg font-bold">{recommendedProg.title}</p>
                  <p className="text-white/70 text-sm mt-1">{recommendedProg.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-white/70 text-xs">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{recommendedProg.duration}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">signal_cellular_alt</span>{recommendedProg.level}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span>{recommendedProg.instructor}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleEnrollProgram(recommendedProg.id)}
                    className="px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 active:scale-95 transition shadow-lg whitespace-nowrap"
                  >
                    Enroll Now
                  </button>
                  <button
                    onClick={() => setDetailProgram(recommendedProg)}
                    className="px-4 py-3 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 active:scale-95 transition whitespace-nowrap"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* No assessment done yet */}
          {!assessmentProfile && (
            <section className="bg-gradient-to-r from-primary-container/30 to-secondary-container/20 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/20">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Personalised For You</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Not sure where to start?</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Take our 2-minute clinical assessment to get program recommendations matched to your stress, anxiety, and sleep needs.
                </p>
              </div>
              <Link to="/assessment"
                className="px-8 py-3.5 bg-primary text-white rounded-full font-bold whitespace-nowrap hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                Take Assessment
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </section>
          )}

          {/* ── My Active Programs ─────────────────────────────────── */}
          <section>
            <div className="flex justify-between items-end mb-md">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">My Active Programs</h2>
                <p className="text-on-surface-variant font-body-md">Continue your journey where you left off.</p>
              </div>
              <span className="text-sm font-semibold text-primary">{activePrograms.length} Enrolled</span>
            </div>

            {activePrograms.length > 0 ? (
              <div className="space-y-5">
                {activePrograms.map((prog) => {
                  const nextMod = prog.modules.find((m) => !m.completed);
                  return (
                    <div key={prog.id} className="bg-surface-container-lowest rounded-[28px] p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                      {/* Thumbnail */}
                      <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden flex-shrink-0 relative group cursor-pointer" onClick={() => setDetailProgram(prog)}>
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={prog.image} alt={prog.title} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm font-bold">{prog.category}</span>
                          <span className="text-on-surface-variant text-xs">· {prog.instructor}</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{prog.title}</h3>
                        {/* Progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-on-surface-variant">
                              {prog.modules.filter((m) => m.completed).length} / {prog.modules.length} activities
                            </span>
                            <span className="text-primary">{prog.progress}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${prog.progress}%` }} />
                          </div>
                        </div>
                        {/* Next activity preview */}
                        {nextMod && (
                          <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low rounded-xl px-3 py-2">
                            <span className={`material-symbols-outlined text-base ${ACTIVITY_TYPE[nextMod.type]?.color || "text-primary"}`}>
                              {ACTIVITY_TYPE[nextMod.type]?.icon || "play_arrow"}
                            </span>
                            <span className="truncate">Next: <span className="font-medium text-on-surface">{nextMod.title}</span></span>
                            <span className="ml-auto text-xs flex-shrink-0">{nextMod.duration}</span>
                          </div>
                        )}
                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={() => setDetailProgram(prog)}
                            className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">play_circle</span>
                            Continue Program
                          </button>
                          <button
                            onClick={() => toggleEnrollProgram(prog.id)}
                            className="px-4 py-2.5 border border-error/30 text-error rounded-full text-xs font-bold hover:bg-error/10 transition"
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-5xl text-outline mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                <p className="text-on-surface font-bold mb-1">No active programs yet</p>
                <p className="text-on-surface-variant text-sm mb-4">Explore the programs below and enroll to start your journey.</p>
              </div>
            )}
          </section>

          {/* ── Explore All Programs ─────────────────────────────── */}
          <section className="space-y-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Explore All Programs</h2>

            {/* Category chips */}
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full font-bold transition-all text-sm ${activeCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Program cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filteredPrograms.map((prog) => (
                <div key={prog.id} className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Card image */}
                  <div className="h-44 relative overflow-hidden cursor-pointer" onClick={() => setDetailProgram(prog)}>
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={prog.image} alt={prog.title} />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-primary">{prog.category}</div>
                    {recommendedProg?.id === prog.id && !prog.enrolled && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        Recommended
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{prog.duration}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">signal_cellular_alt</span>{prog.level}</span>
                    </div>
                    <h4
                      onClick={() => setDetailProgram(prog)}
                      className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors font-bold cursor-pointer"
                    >
                      {prog.title}
                    </h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed flex-1">{prog.description}</p>

                    {/* Activity type pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(prog.modules.map((m) => m.type))].map((t) => {
                        const tc = ACTIVITY_TYPE[t];
                        return tc ? (
                          <span key={t} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.bg} ${tc.color}`}>
                            <span className="material-symbols-outlined text-[11px]">{tc.icon}</span>
                            {tc.label}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Progress bar for enrolled */}
                    {prog.enrolled && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span>Your Progress</span>
                          <span className="text-primary">{prog.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${prog.progress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Enroll / Continue button */}
                    <button
                      onClick={() => prog.enrolled ? setDetailProgram(prog) : toggleEnrollProgram(prog.id)}
                      className={`w-full py-3 rounded-2xl font-bold transition-all text-sm ${prog.enrolled
                        ? "bg-primary text-white hover:opacity-90"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        }`}
                    >
                      {prog.enrolled ? "Continue Program →" : "Enroll in Program"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
        <Footer />
      </div>

      {/* ── Modals & Overlays ─────────────────────────────────────── */}

      {/* Mood picker bottom sheet */}
      {moodPicker && (
        <MoodPicker
          phase={moodPicker.phase}
          onSelect={handleMoodSelect}
          onSkip={handleMoodSkip}
        />
      )}

      {/* Activity modal */}
      {activeModal && (
        <ActivityModal module={activeModal.module} onClose={handleCloseModal} />
      )}

      {/* Program detail drawer */}
      {liveDetailProg && (
        <ProgramDetail
          program={liveDetailProg}
          onClose={() => setDetailProgram(null)}
          onStart={handleStart}
          toggleModuleCompletion={toggleModuleCompletion}
          logActivityMood={logActivityMood}
          setActivityReminder={setActivityReminder}
        />
      )}
    </div>
  );
}

export default Programs;
