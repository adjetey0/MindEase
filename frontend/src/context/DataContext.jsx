import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'mindease_app_data_v1';

const initialDefaultData = {
  isLoggedIn: true,
  hasCompletedAssessment: false,
  assessmentProfile: null,
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Mindfulness seeker & daily meditator. On a journey to stress reduction and emotional balance.',
    streak: 14,
    totalSessions: 32,
    completedProgramsCount: 2,
    badges: [
      { id: 1, name: '7-Day Streak', icon: 'local_fire_department', color: 'text-amber-500 bg-amber-500/10' },
      { id: 2, name: 'Mindfulness Starter', icon: 'spa', color: 'text-emerald-500 bg-emerald-500/10' },
      { id: 3, name: 'Sleep Master', icon: 'bedtime', color: 'text-indigo-500 bg-indigo-500/10' },
      { id: 4, name: 'Community Helper', icon: 'volunteer_activism', color: 'text-rose-500 bg-rose-500/10' },
    ],
    savedResourceIds: [1, 3],
    assessmentHistory: [
      { id: 'asm-1', date: '2026-07-20', score: 12, level: 'Mild Anxiety', recommendation: 'Practice 10-min morning grounding exercise.' },
      { id: 'asm-2', date: '2026-07-25', score: 7, level: 'Low Stress', recommendation: 'Keep up your current evening sleep routine.' },
    ],
  },
  programs: [
    {
      id: 1,
      title: 'Anxiety Relief Blueprint',
      category: 'Anxiety',
      instructor: 'Dr. Aris Thorne',
      duration: '4 Weeks',
      level: 'Beginner',
      enrolled: true,
      progress: 60,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      description: 'A comprehensive guide to understanding anxiety triggers, regulating nervous system responses, and building practical cognitive strategies.',
      modules: [
        { id: 101, title: 'Understanding Anxiety & Nervous System', duration: '15 min', completed: true },
        { id: 102, title: 'Breathwork & Vagus Nerve Stimulation', duration: '20 min', completed: true },
        { id: 103, title: 'Cognitive Restructuring & Reframing', duration: '25 min', completed: true },
        { id: 104, title: 'Building your Exposure Ladder', duration: '30 min', completed: false },
        { id: 105, title: 'Long-term Relapse Prevention', duration: '18 min', completed: false },
      ],
    },
    {
      id: 2,
      title: 'Mindful Sleep Essentials',
      category: 'Sleep',
      instructor: 'Sarah Jenkins, M.Sc.',
      duration: '2 Weeks',
      level: 'All Levels',
      enrolled: true,
      progress: 40,
      image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      description: 'Reset your circadian rhythm, soothe racing nighttime thoughts, and establish deeply restorative sleep hygiene routines.',
      modules: [
        { id: 201, title: 'The Circadian Clock & Light Exposure', duration: '12 min', completed: true },
        { id: 202, title: 'Unwinding the Racing Mind at Night', duration: '18 min', completed: true },
        { id: 203, title: 'Progressive Muscle Relaxation', duration: '22 min', completed: false },
        { id: 204, title: 'Designing your Sleep Sanctuary', duration: '15 min', completed: false },
      ],
    },
    {
      id: 3,
      title: 'Overcoming Burnout & Overwhelm',
      category: 'Stress',
      instructor: 'Elena Rostova',
      duration: '3 Weeks',
      level: 'Intermediate',
      enrolled: false,
      progress: 0,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
      description: 'Reclaim your energy, set healthy boundaries at work and home, and build emotional resilience against chronic exhaustion.',
      modules: [
        { id: 301, title: 'Recognizing Burnout Signals Early', duration: '15 min', completed: false },
        { id: 302, title: 'Setting Firm Psychological Boundaries', duration: '20 min', completed: false },
        { id: 303, title: 'Rest vs. Inactivity: Real Recovery', duration: '25 min', completed: false },
      ],
    },
    {
      id: 4,
      title: 'CBT Skills for Daily Stress',
      category: 'CBT',
      instructor: 'Dr. Michael Chang',
      duration: '5 Weeks',
      level: 'Intermediate',
      enrolled: false,
      progress: 0,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      description: 'Master practical Cognitive Behavioral Therapy techniques to reframe catastrophic thoughts and tackle everyday stress.',
      modules: [
        { id: 401, title: 'Identifying Thought Distortions', duration: '20 min', completed: false },
        { id: 402, title: 'Behavioral Activation Techniques', duration: '25 min', completed: false },
        { id: 403, title: 'Problem Solving vs Worrying', duration: '18 min', completed: false },
      ],
    },
  ],
  communityPosts: [
    {
      id: 1,
      author: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      time: '2 hours ago',
      tag: 'Anxiety',
      title: 'How do you handle sudden panic during work meetings?',
      content: 'Whenever I have to present in front of leadership, my heart starts racing and I lose my train of thought. What grounding technique works fastest for you in high-pressure moments?',
      likes: 24,
      isLiked: false,
      comments: [
        { id: 101, author: 'David Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', text: 'Box breathing (4s in, 4s hold, 4s out, 4s hold) under the desk has saved me multiple times!', time: '1 hour ago' },
        { id: 102, author: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', text: 'Focusing on physical sensations like feeling your feet flat on the floor really helps anchor you.', time: '45 mins ago' }
      ]
    },
    {
      id: 2,
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      time: '5 hours ago',
      tag: 'Sleep',
      title: 'Milestone: 14 consecutive nights of 7+ hours sleep!',
      content: 'After struggling with chronic insomnia for years, cutting screen time 1 hour before bed and doing the Mindful Sleep program made a massive difference.',
      likes: 42,
      isLiked: true,
      comments: [
        { id: 201, author: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'That is incredible Marcus! Keep it up!', time: '3 hours ago' }
      ]
    },
    {
      id: 3,
      author: 'Chloe Lin',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      time: '1 day ago',
      tag: 'Mindfulness',
      title: 'Favorite daily gratitude journal prompts?',
      content: 'I want to start a 5-minute morning writing habit. What prompts give you the most sense of peace and perspective?',
      likes: 18,
      isLiked: false,
      comments: []
    }
  ],
  resources: [
    {
      id: 1,
      category: 'Anxiety',
      title: 'Mastering the Art of Emotional Regulation',
      tag: 'MINDSET',
      readTime: '12 min read',
      bgUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      desc: 'Learn practical cognitive behavioral techniques to navigate complex emotions with grace and resilience.',
      content: 'Emotional regulation is the ability to exert control over one’s emotional state. It involves tactics like cognitive reframing, mindfulness, and sensory grounding.',
      saved: true
    },
    {
      id: 2,
      category: 'CBT',
      title: 'Reframing Negative Thought Patterns',
      tag: 'CBT Basics',
      readTime: '8 min read',
      bgUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
      desc: 'Identify cognitive distortions like catastrophizing and black-and-white thinking, then replace them with balanced perspectives.',
      content: 'Cognitive distortions are biased ways of thinking that reinforce negative emotions. By writing down automatic thoughts, you can challenge their validity.',
      saved: false
    },
    {
      id: 3,
      category: 'Sleep',
      title: 'The Circadian Rhythm Reset Guide',
      tag: 'Sleep Science',
      readTime: '15 min read',
      bgUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
      desc: 'Scientific strategies to align your body clock, maximize melatonin production, and wake up energized.',
      content: 'Morning sunlight exposure within 30 minutes of waking triggers a natural cortisol surge that sets your biological clock for optimal evening melatonin release.',
      saved: true
    },
    {
      id: 4,
      category: 'Stress',
      title: 'Micro-habits for a Clearer Mind',
      tag: 'Habits',
      readTime: '5 min read',
      bgUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      desc: 'Small 60-second rituals throughout your day that keep stress levels low and maintain calm clarity.',
      content: 'Integrating 1-minute breathing pauses between work tasks prevents cumulative stress fatigue throughout the day.',
      saved: false
    },
    {
      id: 5,
      category: 'Mindfulness',
      title: 'The 4-7-8 Breathing Technique Explained',
      tag: 'Breathing',
      readTime: '6 min read',
      bgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      desc: 'How inhaling for 4 seconds, holding for 7, and exhaling for 8 instantly activates your parasympathetic nervous system.',
      content: 'The 4-7-8 technique acts as a natural tranquilizer for the nervous system. With regular practice, it lowers heart rate and blood pressure within minutes.',
      saved: false
    }
  ],
  videoSessions: [
    {
      id: 1,
      title: 'Morning Grounding Practice',
      guide: 'Guided by Dr. Aris Thorne',
      duration: '15:00',
      thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      title: 'Deep Sleep Soundscapes',
      guide: 'Ambient Therapy Series',
      duration: '22:45',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      title: 'Coping with Social Anxiety',
      guide: 'Expert Series with Sarah Jenkins',
      duration: '08:12',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
    }
  ],
  emergencyContacts: [
    { id: 1, name: 'Dr. Emily Watson (Therapist)', phone: '+1 (555) 234-5678', relation: 'Therapist' },
    { id: 2, name: 'David Morgan', phone: '+1 (555) 876-5432', relation: 'Brother / Next of Kin' }
  ],
  hotlines: [
    { id: 1, country: 'United States & Canada', name: '988 Suicide & Crisis Lifeline', number: '988', text: 'Call or text 988 (Available 24/7, free & confidential)', category: 'National' },
    { id: 2, country: 'United States', name: 'Crisis Text Line', number: '741741', text: 'Text HOME to 741741 to connect with a crisis counselor', category: 'Text Support' },
    { id: 3, country: 'United Kingdom', name: 'Samaritans UK', number: '116 123', text: 'Call 116 123 (Free 24/7 support)', category: 'National' },
    { id: 4, country: 'International', name: 'Befrienders Worldwide', number: 'befrienders.org', text: 'Find support services in over 40 countries', category: 'Global' }
  ],
  faqs: [
    { id: 1, question: 'Is MindEase free to use?', answer: 'Yes! MindEase offers free access to core AI chat support, daily mood tracking, community forums, and self-guided mindfulness tools. Premium plans unlock unlimited video sessions and 1-on-1 specialist calls.', category: 'General' },
    { id: 2, question: 'How is my personal data kept confidential?', answer: 'We prioritize your privacy above all. All chats and mood logs are encrypted end-to-end. We never sell your personal health metrics or conversation data to third parties.', category: 'Privacy' },
    { id: 3, question: 'Can MindEase replace clinical therapy?', answer: 'MindEase is designed as a daily mental wellness assistant and psychoeducational tool. While highly effective for self-care and mild-to-moderate stress, it is not a replacement for medical diagnosis or emergency psychiatric care.', category: 'Medical' },
    { id: 4, question: 'How do I track my streak and progress?', answer: 'Every time you log a mood, complete a program module, or participate in a daily exercise, your streak counter automatically increments on your Dashboard and Profile!', category: 'Usage' }
  ],
  supportTickets: [],
  settings: {
    emailNotifications: true,
    smsReminders: false,
    dailyCheckinReminder: true,
    reminderTime: '20:00',
    soundEffects: true,
    analyticsOptIn: false,
    privacyLevel: 'Standard'
  },
  moodLogs: [
    { id: 14, emotion: 'Calm', date: '2026-07-26', note: 'Good evening meditation session.' },
    { id: 13, emotion: 'Focused', date: '2026-07-25', note: 'Completed program module.' },
    { id: 12, emotion: 'Happy', date: '2026-07-24', note: 'Morning walk helped me start fresh.' },
    { id: 11, emotion: 'Calm', date: '2026-07-23', note: 'Deep breathing before bed.' },
    { id: 10, emotion: 'Anxious', date: '2026-07-22', note: 'Work deadline approaching.' },
    { id: 9, emotion: 'Tired', date: '2026-07-21', note: 'Didn\'t sleep well last night.' },
    { id: 8, emotion: 'Happy', date: '2026-07-20', note: 'Had a great call with a friend.' },
    { id: 7, emotion: 'Focused', date: '2026-07-19', note: 'Productive study session.' },
    { id: 6, emotion: 'Calm', date: '2026-07-18', note: 'Yoga in the park.' },
    { id: 5, emotion: 'Happy', date: '2026-07-17', note: 'Cooked a healthy meal.' },
    { id: 4, emotion: 'Stressed', date: '2026-07-16', note: 'Felt overwhelmed mid-day.' },
    { id: 3, emotion: 'Calm', date: '2026-07-15', note: 'Journaling helped clear my mind.' },
    { id: 2, emotion: 'Happy', date: '2026-07-14', note: 'Great weekend morning.' },
    { id: 1, emotion: 'Focused', date: '2026-07-13', note: 'Set intentions for the week.' },
  ],
  chatMessages: [
    { id: 1, sender: 'bot', text: "Hello Alex! 👋 I'm your MindEase AI companion. How are you feeling today? You can share anything that's on your mind.", timestamp: '10:00 AM' }
  ],
  landingStats: [
    { label: 'Active Users Supported', value: '50,000+' },
    { label: 'Daily Mood Checks', value: '250,000+' },
    { label: 'Average Stress Reduction', value: '42%' },
    { label: 'User Satisfaction', value: '4.9 / 5' }
  ],
  testimonials: [
    { id: 1, name: 'Jessica R.', role: 'Graphic Designer', comment: 'MindEase completely transformed how I handle evening anxiety. The guided grounding tools are life-changing.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'David K.', role: 'Software Engineer', comment: 'Having an instant AI companion to talk through burnout triggers at 2 AM gives me immense peace of mind.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
  ]
};

export const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load MindEase data from localStorage', e);
    }
    return initialDefaultData;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save MindEase data to localStorage', e);
    }
  }, [data]);

  // Profile actions
  const updateProfile = (updates) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates }
    }));
  };

  const addAssessmentResult = (result) => {
    const newEntry = {
      id: `asm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...result
    };
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        assessmentHistory: [newEntry, ...(prev.profile.assessmentHistory || [])]
      }
    }));
  };

  // Program actions
  const toggleEnrollProgram = (programId) => {
    setData((prev) => {
      const updatedPrograms = prev.programs.map((p) => {
        if (p.id === programId) {
          const nextEnrolled = !p.enrolled;
          return {
            ...p,
            enrolled: nextEnrolled,
            progress: nextEnrolled ? p.progress || 10 : 0
          };
        }
        return p;
      });
      const enrolledCount = updatedPrograms.filter((p) => p.enrolled && p.progress === 100).length;
      return {
        ...prev,
        programs: updatedPrograms,
        profile: { ...prev.profile, completedProgramsCount: enrolledCount }
      };
    });
  };

  const toggleModuleCompletion = (programId, moduleId) => {
    setData((prev) => {
      const updatedPrograms = prev.programs.map((p) => {
        if (p.id === programId) {
          const updatedModules = p.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: !m.completed } : m
          );
          const completedCount = updatedModules.filter((m) => m.completed).length;
          const newProgress = Math.round((completedCount / updatedModules.length) * 100);
          return {
            ...p,
            modules: updatedModules,
            progress: newProgress
          };
        }
        return p;
      });
      return { ...prev, programs: updatedPrograms };
    });
  };

  // Community actions
  const createCommunityPost = ({ title, content, tag }) => {
    const newPost = {
      id: Date.now(),
      author: data.profile.name,
      avatar: data.profile.avatar,
      time: 'Just now',
      tag: tag || 'General',
      title,
      content,
      likes: 0,
      isLiked: false,
      comments: []
    };
    setData((prev) => ({
      ...prev,
      communityPosts: [newPost, ...prev.communityPosts]
    }));
  };

  const toggleLikePost = (postId) => {
    setData((prev) => ({
      ...prev,
      communityPosts: prev.communityPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    }));
  };

  const addCommentToPost = (postId, commentText) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: data.profile.name,
      avatar: data.profile.avatar,
      text: commentText.trim(),
      time: 'Just now'
    };
    setData((prev) => ({
      ...prev,
      communityPosts: prev.communityPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    }));
  };

  // Resource actions
  const toggleBookmarkResource = (resourceId) => {
    setData((prev) => {
      const isSaved = prev.profile.savedResourceIds.includes(resourceId);
      const newSavedIds = isSaved
        ? prev.profile.savedResourceIds.filter((id) => id !== resourceId)
        : [...prev.profile.savedResourceIds, resourceId];

      const updatedResources = prev.resources.map((r) =>
        r.id === resourceId ? { ...r, saved: !isSaved } : r
      );

      return {
        ...prev,
        resources: updatedResources,
        profile: {
          ...prev.profile,
          savedResourceIds: newSavedIds
        }
      };
    });
  };

  // Emergency contact actions
  const addEmergencyContact = ({ name, phone, relation }) => {
    const newContact = {
      id: Date.now(),
      name,
      phone,
      relation
    };
    setData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const deleteEmergencyContact = (contactId) => {
    setData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== contactId)
    }));
  };

  // Mood logging
  const logMood = (emotion, note = '') => {
    const newLog = {
      id: Date.now(),
      emotion,
      date: new Date().toISOString().split('T')[0],
      note
    };
    setData((prev) => ({
      ...prev,
      moodLogs: [newLog, ...prev.moodLogs],
      profile: { ...prev.profile, streak: prev.profile.streak + 1 }
    }));
  };

  // Chat message sending
  const sendChatMessage = (userText) => {
    if (!userText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setData((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMsg]
    }));

    // Simulate AI response
    setTimeout(() => {
      const botResponses = [
        "Thank you for sharing that with me. How is your body feeling right now as you talk about this?",
        "I hear you. It's completely valid to feel this way. Would you like to try a quick 2-minute breathing exercise together?",
        "That sounds like a lot to carry. Remember to take things one step at a time.",
        "I'm here for you. Have you had a chance to rest or hydrate today?"
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setData((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, botMsg]
      }));
    }, 800);
  };

  // Help support ticket
  const submitSupportTicket = ({ subject, category, message }) => {
    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      message,
      status: 'Open',
      createdAt: new Date().toLocaleDateString()
    };
    setData((prev) => ({
      ...prev,
      supportTickets: [newTicket, ...prev.supportTickets]
    }));
    return newTicket;
  };

  // Settings update
  const updateSettings = (updates) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const resetAllData = () => {
    const loggedOutState = {
      ...initialDefaultData,
      isLoggedIn: false,
      hasCompletedAssessment: false,
      assessmentProfile: null,
      profile: {
        ...initialDefaultData.profile,
        name: '',
        email: '',
        avatar: '',
        bio: '',
      },
    };
    setData(loggedOutState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const completeAssessment = (answers, result) => {
    // answers = { 0: opt, 1: opt, 2: opt, 3: opt } keyed by step index
    const profileData = {
      primaryGoal: answers[0]?.id || null,
      primaryGoalTitle: answers[0]?.title || null,
      emotionalState: answers[1]?.id || null,
      emotionalStateTitle: answers[1]?.title || null,
      sleepQuality: answers[2]?.id || null,
      sleepQualityTitle: answers[2]?.title || null,
      supportPreference: answers[3]?.id || null,
      supportPreferenceTitle: answers[3]?.title || null,
      completedAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      hasCompletedAssessment: true,
      assessmentProfile: profileData,
      profile: {
        ...prev.profile,
        assessmentHistory: [
          {
            id: `asm-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...result,
          },
          ...(prev.profile.assessmentHistory || []),
        ],
      },
    }));
  };

  const signIn = () => {
    setData((prev) => ({ ...prev, isLoggedIn: true }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        updateProfile,
        addAssessmentResult,
        completeAssessment,
        toggleEnrollProgram,
        toggleModuleCompletion,
        createCommunityPost,
        toggleLikePost,
        addCommentToPost,
        toggleBookmarkResource,
        addEmergencyContact,
        deleteEmergencyContact,
        logMood,
        sendChatMessage,
        submitSupportTicket,
        updateSettings,
        resetAllData,
        signIn
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
