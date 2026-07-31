import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';

const stepsData = [
  {
    step: 1,
    category: 'Primary Focus',
    icon: 'target',
    question: 'What is your primary goal for using MindEase?',
    subtitle: 'Select the main area where you would like to experience progress.',
    options: [
      { id: 'reduce-stress', title: 'Reduce Stress & Overwhelm', desc: 'Learn grounding tools to ease daily workplace and personal pressure.', icon: 'spa', points: 3 },
      { id: 'improve-sleep', title: 'Improve Sleep & Rest Quality', desc: 'Build night-time routines and peaceful wind-down habits.', icon: 'nightlight', points: 2 },
      { id: 'manage-anxiety', title: 'Manage Anxiety & Panic', desc: 'Access instant CBT coping techniques and breathing exercises.', icon: 'air', points: 4 },
      { id: 'mental-clarity', title: 'Enhance Focus & Emotional Clarity', desc: 'Clear mental fog and cultivate mindful daily presence.', icon: 'lightbulb', points: 1 },
    ],
  },
  {
    step: 2,
    category: 'Emotional State',
    icon: 'psychology',
    question: 'How have you been feeling over the last few days?',
    subtitle: 'Your honest response helps us personalize your mindfulness journey.',
    options: [
      { id: 'calm-balanced', title: 'Calm and balanced', desc: 'I feel grounded and emotionally steady.', icon: 'self_improvement', points: 1 },
      { id: 'slightly-overwhelmed', title: 'Slightly overwhelmed', desc: 'Feeling a bit stretched but managing.', icon: 'waves', points: 2 },
      { id: 'stressed-anxious', title: 'Stressed and anxious', desc: 'Looking for immediate relief and peace.', icon: 'warning_amber', points: 4 },
      { id: 'foggy-unfocused', title: 'Seeking focus and clarity', desc: 'I want to clear mental fog and improve concentration.', icon: 'psychology_alt', points: 2 },
    ],
  },
  {
    step: 3,
    category: 'Sleep & Energy',
    icon: 'bedtime',
    question: 'How would you rate your sleep and energy levels?',
    subtitle: 'Rest is fundamental to emotional resilience and mood stability.',
    options: [
      { id: 'deep-rested', title: 'Restful and consistent', desc: 'I wake up refreshed and energized most mornings.', icon: 'sentiment_very_satisfied', points: 1 },
      { id: 'trouble-falling-asleep', title: 'Trouble falling asleep', desc: 'Racing thoughts keep me awake at bedtime.', icon: 'schedule', points: 3 },
      { id: 'frequent-waking', title: 'Restless or fragmented sleep', desc: 'I wake up often during the night and feel fatigued.', icon: 'bedtime_off', points: 3 },
      { id: 'low-energy', title: 'Persistent low energy', desc: 'Feeling drained throughout the day regardless of sleep hours.', icon: 'battery_alert', points: 4 },
    ],
  },
  {
    step: 4,
    category: 'Support Preference',
    icon: 'tune',
    question: 'How do you prefer to receive mindfulness guidance?',
    subtitle: 'We will tailor your daily recommended sessions and AI companion tone.',
    options: [
      { id: 'cbt-guided', title: 'Structured CBT Exercises', desc: 'Step-by-step reflections and actionable coping frameworks.', icon: 'fact_check', points: 2 },
      { id: 'conversational-ai', title: 'Empathetic AI Companion Chat', desc: 'Open, supportive conversations available 24/7.', icon: 'forum', points: 2 },
      { id: 'audio-breathwork', title: 'Quick Audio & Breathing Micro-Sessions', desc: '2-5 minute ambient audio sessions for instant decompression.', icon: 'graphic_eq', points: 1 },
      { id: 'journaling', title: 'Guided Daily Journaling', desc: 'Prompts to write and process emotions privately.', icon: 'edit_note', points: 2 },
    ],
  },
];

function Assessment() {
  const { completeAssessment } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get('retake') === 'true';

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScoreResult, setFinalScoreResult] = useState(null);

  const currentStepData = stepsData[currentStep];

  const handleSelectOption = (opt) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentStep]: opt }));
  };

  const handleNext = () => {
    if (currentStep < stepsData.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      let totalPoints = 0;
      Object.values(selectedAnswers).forEach((ans) => {
        if (ans && ans.points) totalPoints += ans.points;
      });

      let level = 'Low Anxiety & Stress';
      let rec = 'Practice 10-minute morning breathing exercises to maintain balance.';
      if (totalPoints > 10) {
        level = 'Moderate Stress & Anxiety';
        rec = 'Enroll in the Anxiety Relief Blueprint program and chat with our AI guide.';
      } else if (totalPoints > 6) {
        level = 'Mild Stress';
        rec = 'Try daily guided sleep soundscapes and micro-journaling.';
      }

      const resultObj = { score: totalPoints, level, recommendation: rec };
      completeAssessment(selectedAnswers, resultObj);
      setFinalScoreResult(resultObj);
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setFinalScoreResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Standalone Navbar */}
      <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 h-16 flex items-center justify-between px-6 md:px-12 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          <span className="font-bold text-xl text-primary tracking-tight">MindEase</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isCompleted && (
            <span className="hidden sm:block text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant/20">
              {isRetake ? 'Retaking Assessment' : 'Personalizing your experience'}
            </span>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-on-surface-variant hover:text-primary font-medium transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Skip for now</span>
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-2xl mx-auto">

          {!isCompleted ? (
            <>
              {/* Progress Header */}
              <div className="mb-8 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
                    Step {currentStep + 1} of {stepsData.length}
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {currentStepData.category}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-outline-variant/20 p-0.5">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${((currentStep + 1) / stepsData.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-10 border border-outline-variant/20 shadow-lg space-y-8">
                <div className="space-y-3">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {currentStepData.icon}
                    </span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-on-surface leading-snug">
                    {currentStepData.question}
                  </h1>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {currentStepData.subtitle}
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {currentStepData.options.map((opt) => {
                    const isSelected = selectedAnswers[currentStep]?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt)}
                        className={`group flex items-center p-4 sm:p-5 rounded-2xl border-2 transition-all text-left active:scale-[0.99] ${isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                          }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-surface-container text-primary group-hover:bg-primary/10'
                            }`}
                        >
                          <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                        </div>
                        <div className="flex-grow pr-2">
                          <p className="font-bold text-on-surface text-base">{opt.title}</p>
                          <p className="text-on-surface-variant text-xs mt-0.5">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                            }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full bg-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 text-primary font-bold text-sm hover:underline disabled:opacity-30 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedAnswers[currentStep]}
                    className="bg-primary text-white rounded-full px-8 sm:px-10 py-3 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    <span>{currentStep === stepsData.length - 1 ? 'Complete & Save' : 'Next'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-14 shadow-2xl border border-outline-variant/20 text-center space-y-8 animate-fade-in">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
              </div>

              <div className="space-y-3 max-w-full mx-auto">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20 inline-block">
                  {isRetake ? 'Profile Updated' : 'Profile Created'}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
                  {finalScoreResult?.level}
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {finalScoreResult?.recommendation}
                </p>
              </div>

              {/* Summary Pills */}
              {Object.keys(selectedAnswers).length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.values(selectedAnswers).map((ans, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20"
                    >
                      {ans.title}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-primary text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:opacity-90 transition text-sm flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="border border-primary/30 text-primary font-bold px-8 py-3.5 rounded-full hover:bg-primary/5 transition text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">forum</span>
                  <span>Start AI Chat</span>
                </button>
              </div>

              <button
                onClick={handleRestart}
                className="text-on-surface-variant hover:text-primary font-semibold text-xs py-2 transition"
              >
                Retake Assessment
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Assessment;
