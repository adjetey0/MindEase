import React, { useState, useEffect, useRef } from "react";

function BreathingTimer({ exercise, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(exercise.phases[0].duration);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIdx = (phaseIndex + 1) % exercise.phases.length;
          if (nextIdx === 0) setCycleCount((c) => c + 1);
          setPhaseIndex(nextIdx);
          return exercise.phases[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, phaseIndex, exercise.phases]);

  const currentPhase = exercise.phases[phaseIndex];
  const progress = 1 - secondsLeft / currentPhase.duration;

  const getScale = () => {
    if (currentPhase.label.toLowerCase().includes("inhale")) return 0.6 + progress * 0.4;
    if (currentPhase.label.toLowerCase().includes("exhale")) return 1 - progress * 0.4;
    return 1;
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].duration);
    setCycleCount(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div
          className="absolute inset-0 rounded-full transition-all duration-1000 ease-in-out opacity-20"
          style={{ background: currentPhase.color || "#7c3aed", transform: `scale(${getScale() * 1.2})` }}
        />
        <div
          className="absolute inset-0 rounded-full transition-all duration-1000 ease-in-out"
          style={{
            background: `radial-gradient(circle at center, ${currentPhase.color || "#7c3aed"}cc, ${currentPhase.color || "#7c3aed"}44)`,
            transform: `scale(${getScale()})`,
          }}
        />
        <div className="relative z-10 text-center select-none">
          <p className="text-white font-bold text-lg leading-tight drop-shadow">{currentPhase.label}</p>
          <p className="text-white/90 text-4xl font-mono font-bold">{secondsLeft}</p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        {exercise.phases.map((ph, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${idx === phaseIndex ? "w-6 opacity-100" : "w-2 opacity-30"}`}
            style={{ background: ph.color || "#7c3aed" }}
          />
        ))}
      </div>

      {cycleCount > 0 && (
        <p className="text-sm text-on-surface-variant font-medium">
          {cycleCount} cycle{cycleCount > 1 ? "s" : ""} completed
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:opacity-90 transition active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">{isRunning ? "pause" : "play_arrow"}</span>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">restart_alt</span>
        </button>
      </div>

      <div className="w-full bg-surface-container-low rounded-2xl p-4 space-y-1.5">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phase Guide</p>
        {exercise.phases.map((ph, idx) => (
          <div key={idx} className={`flex items-center gap-3 text-sm transition-all ${idx === phaseIndex && isRunning ? "text-on-surface font-bold" : "text-on-surface-variant"}`}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ph.color || "#7c3aed", opacity: idx === phaseIndex && isRunning ? 1 : 0.4 }} />
            <span>{ph.label}</span>
            <span className="ml-auto font-mono text-xs">{ph.duration}s</span>
          </div>
        ))}
      </div>

      {onClose && (
        <button onClick={onClose} className="text-sm text-on-surface-variant hover:text-primary transition underline">
          Close
        </button>
      )}
    </div>
  );
}

export default BreathingTimer;
