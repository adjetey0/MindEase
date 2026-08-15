import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUpdateProfile, apiGetDashboard, apiLogMood, apiSubmitAssessment, apiToggleEnrollProgram, apiToggleModuleComplete, apiRecordActivity, apiSendChatMessage, apiGetChatHistory, apiClearChatHistory, apiGetChatSessions, apiCreateChatSession, apiGetSessionMessages, apiRenameChatSession, apiDeleteChatSession, apiGetCommunityPosts, apiCreateCommunityPost, apiUpdateCommunityPost, apiDeleteCommunityPost, apiTogglePostReaction, apiAddPostComment, apiDeletePostComment, apiReportContent, apiGetEmergencyContacts, apiAddEmergencyContact, apiDeleteEmergencyContact, apiDeleteAccount } from '../services/api';
import { fetchDailyMoodCheckins, saveDailyMoodCheckin, calculateStreak, getLocalDateString } from '../services/dailyMoodService';
import { fetchUserEnrollments, enrollInProgram, completeActivityProgress, fetchProgramActivityProgress } from '../services/programService';

const STORAGE_KEY = 'mindease_app_data_v2';

const initialDefaultData = {
  isLoggedIn: false,
  hasCompletedAssessment: false,
  assessmentProfile: null,
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Mindfulness seeker & daily meditator. On a journey to stress reduction and emotional balance.',
    streak: 0,
    totalSessions: 0,
    completedProgramsCount: 0,
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
      enrolled: false,
      progress: 0,
      recommendedFor: ['manage-anxiety', 'stressed-anxious'],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      description: 'A comprehensive guide to understanding anxiety triggers, regulating nervous system responses, and building practical cognitive strategies.',
      modules: [
        { id: 101, title: 'Understanding Anxiety & Nervous System', duration: '15 min', type: 'article', articleId: 'a2', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 102, title: 'Breathwork & Vagus Nerve Stimulation', duration: '10 min', type: 'breathing', breathingId: 'b1', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 103, title: 'Cognitive Restructuring & Reframing', duration: '20 min', type: 'article', articleId: 'a7', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 104, title: 'Building your Exposure Ladder', duration: '30 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 105, title: 'Long-term Relapse Prevention', duration: '18 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
      ],
    },
    {
      id: 2,
      title: 'Mindful Sleep Essentials',
      category: 'Sleep',
      instructor: 'Sarah Jenkins, M.Sc.',
      duration: '2 Weeks',
      level: 'All Levels',
      enrolled: false,
      progress: 0,
      recommendedFor: ['improve-sleep', 'trouble-falling-asleep', 'frequent-waking', 'low-energy'],
      image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      description: 'Reset your circadian rhythm, soothe racing nighttime thoughts, and establish deeply restorative sleep hygiene routines.',
      modules: [
        { id: 201, title: 'The Circadian Clock & Light Exposure', duration: '12 min', type: 'article', articleId: 'a4', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 202, title: 'Unwinding the Racing Mind at Night', duration: '18 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 203, title: 'Progressive Muscle Relaxation', duration: '15 min', type: 'breathing', breathingId: 'b3', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 204, title: 'Designing your Sleep Sanctuary', duration: '15 min', type: 'article', articleId: 'a5', completed: false, moodBefore: null, moodAfter: null, reminder: null },
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
      recommendedFor: ['reduce-stress', 'slightly-overwhelmed', 'low-energy'],
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
      description: 'Reclaim your energy, set healthy boundaries at work and home, and build emotional resilience against chronic exhaustion.',
      modules: [
        { id: 301, title: 'Recognizing Burnout Signals Early', duration: '15 min', type: 'article', articleId: 'a1', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 302, title: 'Setting Firm Psychological Boundaries', duration: '20 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 303, title: 'Rest vs. Inactivity: Real Recovery', duration: '25 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
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
      recommendedFor: ['mental-clarity', 'foggy-unfocused', 'cbt-guided'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      description: 'Master practical Cognitive Behavioral Therapy techniques to reframe catastrophic thoughts and tackle everyday stress.',
      modules: [
        { id: 401, title: 'Identifying Thought Distortions', duration: '20 min', type: 'article', articleId: 'a7', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 402, title: 'Behavioral Activation Techniques', duration: '25 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 403, title: 'Problem Solving vs Worrying', duration: '18 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
      ],
    },
    {
      id: 5,
      title: '7-Day Stress Relief Program',
      category: 'Stress',
      instructor: 'Dr. Aris Thorne',
      duration: '1 Week',
      level: 'Beginner',
      enrolled: false,
      progress: 0,
      recommendedFor: ['reduce-stress', 'slightly-overwhelmed', 'stressed-anxious'],
      image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=800&q=80',
      description: 'A focused 7-day programme combining breathwork, mindfulness, and psychoeducation to dramatically reduce stress in just one week.',
      modules: [
        { id: 501, title: 'Day 1: Understanding Your Stress', duration: '12 min', type: 'article', articleId: 'a1', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 502, title: 'Day 2: Belly Breathing for Calm', duration: '10 min', type: 'breathing', breathingId: 'b3', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 503, title: 'Day 3: Mindful Body Scan', duration: '15 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 504, title: 'Day 4: Stress Journalling Exercise', duration: '20 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 505, title: 'Day 5: Box Breathing Mastery', duration: '10 min', type: 'breathing', breathingId: 'b1', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 506, title: 'Day 6: How Breathing Controls Your Nervous System', duration: '12 min', type: 'article', articleId: 'a8', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 507, title: 'Day 7: Coherent Breathing & Reflection', duration: '15 min', type: 'breathing', breathingId: 'b4', completed: false, moodBefore: null, moodAfter: null, reminder: null },
      ],
    },
    {
      id: 6,
      title: 'Mindfulness Starter Journey',
      category: 'Mindfulness',
      instructor: 'Sarah Jenkins, M.Sc.',
      duration: '1 Week',
      level: 'Beginner',
      enrolled: false,
      progress: 0,
      recommendedFor: ['mental-clarity', 'calm-balanced', 'audio-breathwork'],
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=800&q=80',
      description: 'Your first week of mindfulness - from understanding what it is to building a sustainable daily practice with breath and body awareness.',
      modules: [
        { id: 601, title: 'What Is Mindfulness? A Scientific Introduction', duration: '12 min', type: 'article', articleId: 'a6', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 602, title: 'Breath Awareness Practice', duration: '10 min', type: 'breathing', breathingId: 'b3', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 603, title: 'Guided Body Scan Meditation', duration: '15 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 604, title: 'How Breathing Controls Your Nervous System', duration: '12 min', type: 'article', articleId: 'a8', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 605, title: '4-7-8 Relaxation Breathing', duration: '8 min', type: 'breathing', breathingId: 'b2', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 606, title: 'Mindful Walking Exercise', duration: '20 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 607, title: 'Loving Kindness Meditation', duration: '15 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
      ],
    },
    {
      id: 7,
      title: 'CBT for Anxiety Management',
      category: 'Anxiety',
      instructor: 'Dr. Michael Chang',
      duration: '4 Weeks',
      level: 'Intermediate',
      enrolled: false,
      progress: 0,
      recommendedFor: ['manage-anxiety', 'stressed-anxious', 'cbt-guided'],
      image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?auto=format&fit=crop&w=800&q=80',
      description: 'Evidence-based CBT techniques specifically designed to identify, challenge, and rewire anxiety-driven thought patterns for lasting relief.',
      modules: [
        { id: 701, title: "The Science of Anxiety: Your Brain's Alarm System", duration: '14 min', type: 'article', articleId: 'a2', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 702, title: '5 Evidence-Based Anxiety Strategies', duration: '12 min', type: 'article', articleId: 'a3', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 703, title: 'Box Breathing for Acute Anxiety', duration: '10 min', type: 'breathing', breathingId: 'b1', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 704, title: 'Cognitive Reframing Practice', duration: '20 min', type: 'article', articleId: 'a7', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 705, title: 'Thought Record Worksheet Exercise', duration: '25 min', type: 'exercise', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 706, title: 'Coherent Breathing for HRV', duration: '10 min', type: 'breathing', breathingId: 'b4', completed: false, moodBefore: null, moodAfter: null, reminder: null },
        { id: 707, title: 'Progressive Relaxation & Review', duration: '18 min', type: 'mindfulness', completed: false, moodBefore: null, moodAfter: null, reminder: null },
      ],
    },
  ],
  communityPosts: [],
  resources: [
    {
      id: 1,
      category: 'Anxiety',
      title: 'Mastering the Art of Emotional Regulation',
      tag: 'MINDSET',
      readTime: '12 min read',
      bgUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      desc: 'Learn practical cognitive behavioral techniques to navigate complex emotions with grace and resilience.',
      content: 'Emotional regulation is the ability to exert control over oneÃ¢â‚¬â„¢s emotional state. It involves tactics like cognitive reframing, mindfulness, and sensory grounding.',
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
      title: 'Stress Relief & Inner Calmness',
      guide: 'Guided by Dr. Aris Thorne',
      duration: '10:15',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      videoUrl: '/assets/videos/streessRelief.mp4',
      description: 'A 10-minute guided stress relief session designed to regulate your autonomic nervous system, soothe racing thoughts, and restore emotional equilibrium.'
    },
    {
      id: 2,
      title: 'Mindful Yoga & Somatic Movement',
      guide: 'Guided by Elena Rostova',
      duration: '18:30',
      thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
      videoUrl: '/assets/videos/yoga.mp4',
      description: 'An immersive mindful yoga flow combining deep diaphragmatic breathing with gentle somatic stretches to release stored physical tension.'
    },
    {
      id: 3,
      title: 'Morning Grounding & Breathwork',
      guide: 'Guided by Sarah Jenkins, M.Sc.',
      duration: '12:00',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
      videoUrl: '/assets/videos/streessRelief.mp4',
      description: 'Gentle morning grounding and vagus nerve stimulation practice to clear morning brain fog and build resilience against daily anxiety.'
    },
    {
      id: 4,
      title: 'Restorative Sunset Yoga & Sleep Prep',
      guide: 'Ambient Yoga Series',
      duration: '20:00',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      videoUrl: '/assets/videos/yoga.mp4',
      description: 'A tranquil evening yoga flow and progressive relaxation session to signal your body that it is time for deep, restful sleep.'
    }
  ],
  emergencyContacts: [
    { id: 1, name: 'Dr. Emily Watson (Therapist)', phone: '+1 (555) 234-5678', relation: 'Therapist' },
    { id: 2, name: 'David Morgan', phone: '+1 (555) 876-5432', relation: 'Brother / Next of Kin' }
  ],
  hotlines: [
    { id: 1, country: 'Ghana', name: 'Ã°Å¸Å¡Â¨ National Emergency Hotline', number: '112', text: 'Free from all mobile networks Ã¢â‚¬â€œ Available 24/7', category: 'National Emergency' },
    { id: 2, country: 'Ghana', name: 'Ã°Å¸Å¡â€˜ National Ambulance Service', number: '193', text: 'Call 193 for medical emergencies', category: 'Medical Emergency' },
    { id: 3, country: 'Ghana', name: 'Ã°Å¸â€˜Â® Ghana Police Service', number: '191', text: 'Call 191 or toll-free 18555 (MTN & Vodafone)', category: 'Police' },
    { id: 4, country: 'Ghana', name: 'Ã°Å¸Å’Å  NADMO Disaster Management', number: '029 935 0030', text: 'National Disaster Management Organisation', category: 'Disaster' }
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
  moodLogs: [],
  chatMessages: [
    { id: 1, sender: 'bot', text: "Hello! 👋 I'm your MindEase AI companion. How are you feeling today? You can share anything that's on your mind.", timestamp: '10:00 AM' }
  ],
  pastChatSessions: [],
  landingStats: [
    { label: 'Active Users Supported', value: '50,000+' },
    { label: 'Daily Mood Checks', value: '250,000+' },
    { label: 'Average Stress Reduction', value: '42%' },
    { label: 'User Satisfaction', value: '4.9 / 5' }
  ],
  testimonials: [
    { id: 1, name: 'Jessica R.', role: 'Graphic Designer', comment: 'MindEase completely transformed how I handle evening anxiety. The guided grounding tools are life-changing.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'David K.', role: 'Software Engineer', comment: 'Having an instant AI companion to talk through burnout triggers at 2 AM gives me immense peace of mind.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
  ],
  communityPosts: []
};

export const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const isMockPost = (p) => {
  if (!p) return false;
  const mockIds = [1, 2, 3, '1', '2', '3', 'mock-1', 'mock-2', 'mock-3'];
  const mockAuthors = ['Sarah Jenkins', 'Marcus Vance', 'Chloe Lin'];
  const mockTitles = [
    'How do you handle sudden panic during work meetings?',
    'Milestone: 14 consecutive nights of 7+ hours sleep!',
    'Favorite daily gratitude journal prompts?'
  ];
  return mockIds.includes(p.id) || mockAuthors.includes(p.author) || mockTitles.includes(p.title);
};

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const SHARED_POSTS_KEY = 'mindease_shared_community_posts';
    let sharedPosts = [];
    try {
      const savedShared = localStorage.getItem(SHARED_POSTS_KEY);
      if (savedShared) {
        const parsed = JSON.parse(savedShared);
        if (Array.isArray(parsed)) sharedPosts = parsed.filter((p) => !isMockPost(p));
      }
    } catch (e) { }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.profile?.email && (parsed.profile.email.startsWith('ey') || !parsed.profile.email.includes('@'))) {
          parsed.profile.email = 'alex.morgan@example.com';
        }
        
        const existingStatePosts = Array.isArray(parsed?.communityPosts) ? parsed.communityPosts.filter((p) => !isMockPost(p)) : [];
        const mergedPostsMap = new Map();
        sharedPosts.forEach((p) => mergedPostsMap.set(p.id, p));
        existingStatePosts.forEach((p) => mergedPostsMap.set(p.id, p));

        parsed.communityPosts = Array.from(mergedPostsMap.values());

        const userEmail = (parsed?.profile?.email && parsed.profile.email.includes('@')) ? parsed.profile.email.trim().toLowerCase() : '';
        if (userEmail) {
          const savedAvatar = localStorage.getItem(`mindease_user_avatar_${userEmail}`);
          if (savedAvatar) {
            parsed.profile.avatar = savedAvatar;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load MindEase data from localStorage', e);
    }
    return { ...initialDefaultData, communityPosts: sharedPosts };
  });

  const [dailyCheckins, setDailyCheckins] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);

  const refreshDailyCheckins = useCallback(async (userEmail = '') => {
    try {
      // Pass the email directly to avoid relying on localStorage timing
      // (React state updates are async, so localStorage may still hold old user data)
      const list = await fetchDailyMoodCheckins(userEmail || null);
      setDailyCheckins(list || []);
    } catch (e) {
      console.warn('Failed to fetch daily mood checkins:', e);
    }
  }, []);

  const refreshEnrollments = useCallback(async (overrideEmail = '') => {
    const cleanEmail = (overrideEmail || data.profile?.email || '').trim().toLowerCase();
    try {
      const list = await fetchUserEnrollments(cleanEmail);
      setUserEnrollments(list || []);
    } catch (e) {
      console.warn('Failed to fetch user enrollments:', e);
    }
  }, [data.profile?.email]);

  useEffect(() => {
    // Use the Flask user.id (UUID) as the cache key hint for checkin scoping
    const currentIdHint = data.profile?.id || data.profile?.user_id || (data.profile?.email || '').trim().toLowerCase() || null;
    refreshDailyCheckins(currentIdHint);
    refreshEnrollments();

    // Proactively purge any legacy mock posts stored in browser localStorage
    try {
      const keysToScrub = [STORAGE_KEY, SHARED_POSTS_KEY];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mindease_user_posts_')) {
          keysToScrub.push(k);
        }
      }
      keysToScrub.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((p) => !isMockPost(p));
              localStorage.setItem(key, JSON.stringify(cleaned));
            } else if (parsed && parsed.communityPosts && Array.isArray(parsed.communityPosts)) {
              parsed.communityPosts = parsed.communityPosts.filter((p) => !isMockPost(p));
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          }
        } catch (e) { }
      });
    } catch (e) { }
  }, [refreshDailyCheckins, refreshEnrollments, data.isLoggedIn]);

  const handleSaveDailyCheckin = async (moodLabel, note = '') => {
    // Pass the user's Flask UUID as the cache-key hint (never sent to Flask itself)
    const userIdHint = data.profile?.id || data.profile?.user_id || null;
    const res = await saveDailyMoodCheckin(moodLabel, note, userIdHint);
    if (res && res.allCheckins) {
      setDailyCheckins(res.allCheckins);
    }
    return res;
  };

  const dailyStreak = calculateStreak(dailyCheckins);
  const todayStr = getLocalDateString(new Date());
  const todayCheckin = dailyCheckins.find((c) => c.check_in_date === todayStr) || null;

  const refreshEmergencyContacts = useCallback(async (userEmail = '') => {
    const cleanEmail = (userEmail || data.profile?.email || '').trim().toLowerCase();
    const storageKey = cleanEmail ? `mindease_emergency_contacts_${cleanEmail}` : '';

    try {
      const res = await apiGetEmergencyContacts();
      if (res && res.contacts && Array.isArray(res.contacts)) {
        const formatted = res.contacts.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          relation: c.relation || ''
        }));
        setData((prev) => ({ ...prev, emergencyContacts: formatted }));
        if (storageKey) {
          try { localStorage.setItem(storageKey, JSON.stringify(formatted)); } catch (e) { }
        }
        return;
      }
    } catch (e) {
      console.warn('apiGetEmergencyContacts notice:', e);
    }

    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setData((prev) => ({ ...prev, emergencyContacts: parsed }));
          }
        }
      } catch (e) { }
    }
  }, [data.profile?.email]);

  const refreshUserChatHistory = useCallback(async (userEmail = '') => {
    const cleanEmail = (userEmail || data.profile?.email || '').trim().toLowerCase();
    if (!cleanEmail) return;

    const msgsKey = `mindease_chat_messages_${cleanEmail}`;
    const pastKey = `mindease_past_sessions_${cleanEmail}`;
    const sessionKey = `mindease_chat_session_${cleanEmail}`;

    try {
      const savedMsgs = localStorage.getItem(msgsKey);
      const savedPast = localStorage.getItem(pastKey);
      let restoredMsgs = [initialDefaultData.chatMessages[0]];
      let restoredPast = [];

      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) restoredMsgs = parsed;
      }

      if (savedPast) {
        const parsed = JSON.parse(savedPast);
        if (Array.isArray(parsed)) restoredPast = parsed;
      }

      setData((prev) => ({
        ...prev,
        chatMessages: restoredMsgs,
        pastChatSessions: restoredPast
      }));
    } catch (e) {
      console.warn('Per-user chat restoration notice:', e);
    }

    // 2. Sync from backend API if active session ID exists
    try {
      const activeSid = localStorage.getItem('mindease_chat_session_id');
      if (activeSid) {
        const chatRes = await apiGetChatHistory(activeSid);
        if (chatRes && chatRes.messages && Array.isArray(chatRes.messages) && chatRes.messages.length > 0) {
          const liveMessages = chatRes.messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.content || m.text,
            timestamp: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));

          setData((prev) => ({ ...prev, chatMessages: liveMessages }));
          try { localStorage.setItem(msgsKey, JSON.stringify(liveMessages)); } catch (e) { }
        }
      }
    } catch (e) {
      console.warn('Backend chat history fetch notice:', e);
    }
  }, [data.profile?.email]);

  const SHARED_POSTS_KEY = 'mindease_shared_community_posts';

  const getSharedPostsLocally = () => {
    try {
      const saved = localStorage.getItem(SHARED_POSTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p) => !isMockPost(p));
      }
    } catch (e) { }
    return [];
  };

  const sanitizePostOwnership = (post, userEmail = '') => {
    if (!post) return post;
    const cleanEmail = (userEmail || data.profile?.email || '').trim().toLowerCase();
    const currentUserId = String(data.profile?.id || data.profile?.user_id || '').trim();
    const currentUserName = (data.profile?.name || '').trim().toLowerCase();

    let likedBy = Array.isArray(post.liked_by) ? post.liked_by : [];
    let isLiked = false;
    if (cleanEmail && likedBy.length > 0) {
      isLiked = likedBy.includes(cleanEmail);
    } else if (post.isLiked !== undefined) {
      isLiked = Boolean(post.isLiked);
    } else if (post.is_liked !== undefined) {
      isLiked = Boolean(post.is_liked);
    }

    let isOwner = false;
    if (post.owner_email && cleanEmail && post.owner_email.trim().toLowerCase() === cleanEmail) {
      isOwner = true;
    } else if (post.user_id && currentUserId && String(post.user_id).toLowerCase() === currentUserId.toLowerCase()) {
      isOwner = true;
    } else if (post.is_owner === true) {
      isOwner = true;
    } else if (!post.is_anonymous && post.author && currentUserName && post.author.trim().toLowerCase() === currentUserName) {
      isOwner = true;
    } else if (!post.is_anonymous && post.author_display && currentUserName && post.author_display.trim().toLowerCase() === currentUserName) {
      isOwner = true;
    }

    const sanitizedComments = (post.comments || []).map((c) => {
      let isCommentOwner = false;
      if (c.owner_email && cleanEmail && c.owner_email.trim().toLowerCase() === cleanEmail) {
        isCommentOwner = true;
      } else if (c.user_id && currentUserId && String(c.user_id).toLowerCase() === currentUserId.toLowerCase()) {
        isCommentOwner = true;
      } else if (c.is_owner === true) {
        isCommentOwner = true;
      } else if (!c.is_anonymous && (c.author || c.author_display) && currentUserName && (c.author || c.author_display).trim().toLowerCase() === currentUserName) {
        isCommentOwner = true;
      }
      return {
        ...c,
        is_owner: isCommentOwner
      };
    });

    const lCount = Math.max(
      post.likeCount || 0,
      post.likes || 0,
      likedBy.length
    );
    const cCount = Math.max(
      post.commentCount || 0,
      sanitizedComments.length
    );

    return {
      ...post,
      owner_email: post.owner_email || (isOwner ? cleanEmail : undefined),
      likeCount: lCount,
      likes: lCount,
      commentCount: cCount,
      isLiked: isLiked,
      is_liked: isLiked,
      liked_by: likedBy,
      is_owner: isOwner,
      comments: sanitizedComments
    };
  };

  const saveSharedPostLocally = (post) => {
    if (!post || !post.id) return;
    try {
      let list = getSharedPostsLocally();
      const sharedPost = {
        ...post,
        comments: (post.comments || []).map((c) => ({ ...c }))
      };
      const idx = list.findIndex((p) => p.id === post.id);
      if (idx >= 0) {
        const existing = list[idx];
        const mergedLikedBy = Array.from(new Set([...(existing.liked_by || []), ...(sharedPost.liked_by || [])]));
        const maxLikes = Math.max(existing.likeCount || 0, existing.likes || 0, sharedPost.likeCount || 0, sharedPost.likes || 0, mergedLikedBy.length);
        const maxComments = Math.max(existing.commentCount || 0, (existing.comments || []).length, sharedPost.commentCount || 0, (sharedPost.comments || []).length);

        list[idx] = {
          ...existing,
          ...sharedPost,
          liked_by: mergedLikedBy,
          likeCount: maxLikes,
          likes: maxLikes,
          commentCount: maxComments
        };
      } else {
        list.unshift(sharedPost);
      }
      localStorage.setItem(SHARED_POSTS_KEY, JSON.stringify(list));
    } catch (e) { }
  };

  const removeSharedPostLocally = (postId) => {
    if (!postId) return;
    try {
      let list = getSharedPostsLocally().filter((p) => p.id !== postId);
      localStorage.setItem(SHARED_POSTS_KEY, JSON.stringify(list));
    } catch (e) { }
  };

  const saveUserPostLocally = (post, userEmail = '') => {
    const cleanEmail = (userEmail || data.profile?.email || 'alex.morgan@example.com').trim().toLowerCase();
    if (!post) return;
    const postsKey = `mindease_user_posts_${cleanEmail}`;
    try {
      const saved = localStorage.getItem(postsKey);
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex((p) => p.id === post.id);
      if (idx >= 0) {
        list[idx] = post;
      } else {
        list.unshift(post);
      }
      localStorage.setItem(postsKey, JSON.stringify(list));
    } catch (e) { }
  };

  const removeUserPostLocally = (postId, userEmail = '') => {
    const cleanEmail = (userEmail || data.profile?.email || '').trim().toLowerCase();
    if (!cleanEmail || !postId) return;
    const postsKey = `mindease_user_posts_${cleanEmail}`;
    try {
      const saved = localStorage.getItem(postsKey);
      let list = saved ? JSON.parse(saved) : [];
      if (Array.isArray(list)) {
        list = list.filter((p) => p.id !== postId);
        localStorage.setItem(postsKey, JSON.stringify(list));
      }
    } catch (e) { }
  };

  const refreshUserCommunityPosts = useCallback(async (userEmail = '') => {
    const cleanEmail = (userEmail || data.profile?.email || '').trim().toLowerCase();

    try {
      const sharedPosts = getSharedPostsLocally();
      let userPosts = [];
      if (cleanEmail) {
        const postsKey = `mindease_user_posts_${cleanEmail}`;
        const savedPosts = localStorage.getItem(postsKey);
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed)) userPosts = parsed.filter((p) => !isMockPost(p));
        }
      }

      setData((prev) => {
        const existingMap = new Map((prev.communityPosts || []).map((p) => [p.id, p]));
        sharedPosts.forEach((p) => {
          if (!existingMap.has(p.id)) {
            existingMap.set(p.id, p);
          }
        });
        userPosts.forEach((p) => {
          if (!existingMap.has(p.id)) {
            existingMap.set(p.id, p);
          }
        });
        const combined = Array.from(existingMap.values()).map((p) => sanitizePostOwnership(p, cleanEmail));
        return {
          ...prev,
          communityPosts: combined
        };
      });
    } catch (e) {
      console.warn('Per-user & shared posts restoration notice:', e);
    }
  }, [data.profile?.email]);

  const refreshLiveData = useCallback(async () => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();

    // 1. Fetch live community posts from backend
    let liveCommunityPosts = null;
    try {
      const communityRes = await apiGetCommunityPosts();
      if (communityRes && communityRes.posts && Array.isArray(communityRes.posts)) {
        liveCommunityPosts = communityRes.posts;
      }
    } catch (e) {
      console.warn('Live community posts fetch notice:', e);
    }

    // 2. Fetch live dashboard data if user is authenticated
    let res = null;
    try {
      res = await apiGetDashboard();
    } catch (err) {
      console.warn('Could not refresh live dashboard profile:', err);
    }

    const userEmail = (res?.user?.email && res.user.email.includes('@'))
      ? res.user.email.trim().toLowerCase()
      : (cleanEmail || 'alex.morgan@example.com');
    const savedAvatar = userEmail ? localStorage.getItem(`mindease_user_avatar_${userEmail}`) : null;
    const finalAvatar = savedAvatar || res?.user?.avatar_url || data.profile?.avatar;

    if (userEmail && (savedAvatar || res?.user?.avatar_url)) {
      try {
        localStorage.setItem(`mindease_user_avatar_${userEmail}`, finalAvatar);
      } catch (e) { }
    }

    let localUserPosts = [];
    if (userEmail) {
      try {
        const savedPosts = localStorage.getItem(`mindease_user_posts_${userEmail}`);
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed)) localUserPosts = parsed.filter((p) => !isMockPost(p));
        }
      } catch (e) { }
    }

    const sharedLocalPosts = getSharedPostsLocally();

    // Merge backend posts, shared local posts, user posts, and existing state posts
    let combinedPostsMap = new Map();
    if (liveCommunityPosts) {
      liveCommunityPosts.forEach((p) => combinedPostsMap.set(p.id, p));
    }
    sharedLocalPosts.forEach((p) => {
      if (!combinedPostsMap.has(p.id)) {
        combinedPostsMap.set(p.id, p);
      }
    });
    localUserPosts.forEach((p) => {
      if (!combinedPostsMap.has(p.id)) {
        combinedPostsMap.set(p.id, p);
      }
    });

    setData((prev) => {
      // Retain any post currently in state that hasn't been synced yet
      (prev.communityPosts || []).forEach((p) => {
        if (!combinedPostsMap.has(p.id) && !isMockPost(p)) {
          combinedPostsMap.set(p.id, p);
        }
      });

      const finalPosts = Array.from(combinedPostsMap.values()).map((p) => sanitizePostOwnership(p, userEmail));

      return {
        ...prev,
        profile: {
          ...prev.profile,
          ...(res?.user?.name ? { name: res.user.name } : {}),
          email: userEmail || (prev.profile.email && prev.profile.email.includes('@') ? prev.profile.email : 'alex.morgan@example.com'),
          avatar: finalAvatar,
          ...(res?.user?.bio !== undefined ? { bio: res.user.bio } : {}),
          streak: res?.streak !== undefined ? res.streak : prev.profile?.streak || 0,
          totalSessions: res?.total_sessions !== undefined ? res.total_sessions : prev.profile?.totalSessions || 0,
          completedProgramsCount: res?.completed_programs_count || prev.profile?.completedProgramsCount || 0,
          savedResourceIds: res?.saved_resource_ids || prev.profile.savedResourceIds || [],
          assessmentHistory: res?.assessment_history || prev.profile.assessmentHistory || []
        },
        ...(res?.mood_logs ? { moodLogs: res.mood_logs } : {}),
        hasCompletedAssessment: res?.latest_assessment ? true : prev.hasCompletedAssessment,
        assessmentProfile: res?.latest_assessment ? {
          primaryGoalTitle: res.latest_assessment.primary_goal_title,
          emotionalStateTitle: res.latest_assessment.emotional_state_title,
          supportPreferenceTitle: res.latest_assessment.support_preference_title,
        } : prev.assessmentProfile,
        communityPosts: finalPosts
      };
    });

    if (userEmail) {
      await refreshEmergencyContacts(userEmail);
      await refreshUserChatHistory(userEmail);
      await refreshUserCommunityPosts(userEmail);
    }
  }, [data.profile?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save MindEase data to localStorage', e);
    }
  }, [data]);

  useEffect(() => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    if (cleanEmail) {
      try {
        if (data.chatMessages && data.chatMessages.length > 0) {
          localStorage.setItem(`mindease_chat_messages_${cleanEmail}`, JSON.stringify(data.chatMessages));
        }
        if (data.pastChatSessions) {
          localStorage.setItem(`mindease_past_sessions_${cleanEmail}`, JSON.stringify(data.pastChatSessions));
        }
        const activeSid = localStorage.getItem('mindease_chat_session_id');
        if (activeSid) {
          localStorage.setItem(`mindease_chat_session_${cleanEmail}`, activeSid);
        }
      } catch (e) { }
    }
  }, [data.chatMessages, data.pastChatSessions, data.profile?.email]);

  useEffect(() => {
    refreshLiveData();
    refreshEmergencyContacts(data.profile?.email);
    refreshUserChatHistory(data.profile?.email);
    refreshUserCommunityPosts(data.profile?.email);
  }, [data.isLoggedIn]);

  // Profile actions
  const updateProfile = (updates) => {
    const nextProfile = { ...data.profile, ...updates };
    const userEmail = (nextProfile.email && nextProfile.email.includes('@')) ? nextProfile.email.trim().toLowerCase() : '';
    if (userEmail && nextProfile.avatar) {
      try {
        localStorage.setItem(`mindease_user_avatar_${userEmail}`, nextProfile.avatar);
      } catch (e) { }
    }

    setData((prev) => ({
      ...prev,
      profile: nextProfile
    }));

    apiUpdateProfile({
      name: nextProfile.name,
      email: nextProfile.email,
      bio: nextProfile.bio,
      avatar: nextProfile.avatar
    });
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
  const toggleEnrollProgram = async (programId) => {
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
      return {
        ...prev,
        programs: updatedPrograms
      };
    });

    await apiToggleEnrollProgram(programId);
    refreshLiveData();
  };

  const toggleModuleCompletion = async (programId, moduleId) => {
    let targetModule = null;
    setData((prev) => {
      const updatedPrograms = prev.programs.map((p) => {
        if (p.id === programId) {
          const updatedModules = p.modules.map((m) => {
            if (m.id === moduleId) {
              targetModule = { ...m, completed: !m.completed };
              return targetModule;
            }
            return m;
          });
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

    await apiToggleModuleComplete(programId, moduleId, targetModule?.moodBefore, targetModule?.moodAfter);
    await apiRecordActivity('exercise');
    refreshLiveData();
  };

  // Log mood before/after an activity
  const logActivityMood = (programId, moduleId, phase, mood) => {
    setData((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId
          ? {
            ...p,
            modules: p.modules.map((m) =>
              m.id === moduleId
                ? { ...m, [phase === 'before' ? 'moodBefore' : 'moodAfter']: mood }
                : m
            ),
          }
          : p
      ),
    }));
  };

  // Set a daily reminder time for an activity
  const setActivityReminder = (programId, moduleId, time) => {
    setData((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId
          ? {
            ...p,
            modules: p.modules.map((m) =>
              m.id === moduleId ? { ...m, reminder: time } : m
            ),
          }
          : p
      ),
    }));
  };

  // Community actions
  const createCommunityPost = async ({ title, content, category, tag, is_anonymous }) => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const currentUserId = String(data.profile?.id || data.profile?.user_id || `usr_${Date.now()}`).trim();
    const finalCategory = category || tag || 'General';
    const isAnon = Boolean(is_anonymous);
    const authorName = isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member');

    try {
      const res = await apiCreateCommunityPost({
        title,
        content,
        category: finalCategory,
        is_anonymous: isAnon,
        author: authorName,
        author_display: authorName
      });
      if (res && res.post) {
        const postWithOwnership = {
          ...res.post,
          owner_email: cleanEmail,
          user_id: currentUserId,
          is_owner: true
        };
        saveSharedPostLocally(postWithOwnership);
        saveUserPostLocally(postWithOwnership, cleanEmail);
        setData((prev) => ({
          ...prev,
          communityPosts: [postWithOwnership, ...prev.communityPosts.filter((p) => p.id !== res.post.id)]
        }));
        return postWithOwnership;
      }
    } catch (e) {
      console.warn('Backend create post notice (using local fallback):', e);
    }

    // Local fallback creation
    const localPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: currentUserId,
      owner_email: cleanEmail,
      author: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
      author_display: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
      avatar: isAnon ? '' : (data.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`),
      avatar_url: isAnon ? '' : (data.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`),
      created_at: new Date().toISOString(),
      category: finalCategory,
      tag: finalCategory,
      is_anonymous: isAnon,
      title: title || '',
      content: content,
      likes: 0,
      likeCount: 0,
      isLiked: false,
      is_owner: true,
      comments: []
    };

    saveSharedPostLocally(localPost);
    saveUserPostLocally(localPost, cleanEmail);
    setData((prev) => ({
      ...prev,
      communityPosts: [localPost, ...(prev.communityPosts || []).filter((p) => p.id !== localPost.id)]
    }));
    return localPost;
  };

  const updateCommunityPost = async (postId, { title, content, category, tag, is_anonymous }) => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const finalCategory = category || tag || 'General';
    const targetPost = (data.communityPosts || []).find((p) => p.id === postId);

    if (targetPost && targetPost.is_owner === false && targetPost.owner_email && cleanEmail && targetPost.owner_email !== cleanEmail) {
      console.warn('Blocked attempt to edit post owned by another user.');
      return null;
    }

    try {
      const res = await apiUpdateCommunityPost(postId, { title, content, category: finalCategory, is_anonymous });
      if (res && res.post) {
        const sanitized = sanitizePostOwnership(res.post, cleanEmail);
        setData((prev) => ({
          ...prev,
          communityPosts: prev.communityPosts.map((p) => (p.id === postId ? { ...p, ...sanitized } : p))
        }));
        saveUserPostLocally(sanitized, cleanEmail);
        saveSharedPostLocally(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('Backend update post notice:', e);
    }

    let updatedPost = null;
    setData((prev) => ({
      ...prev,
      communityPosts: prev.communityPosts.map((p) => {
        if (p.id === postId) {
          const isAnon = is_anonymous !== undefined ? Boolean(is_anonymous) : Boolean(p.is_anonymous);
          updatedPost = {
            ...p,
            title,
            content,
            category: finalCategory,
            tag: finalCategory,
            is_anonymous: isAnon,
            author: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
            author_display: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
            avatar: isAnon ? '' : (data.profile?.avatar || p.avatar),
            avatar_url: isAnon ? '' : (data.profile?.avatar || p.avatar),
            owner_email: cleanEmail,
            is_owner: true
          };
          return updatedPost;
        }
        return p;
      })
    }));
    if (updatedPost) {
      saveUserPostLocally(updatedPost, cleanEmail);
      saveSharedPostLocally(updatedPost);
    }
    return updatedPost;
  };

  const deleteCommunityPost = async (postId) => {
    if (!postId) return;
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();

    try {
      await apiDeleteCommunityPost(postId);
    } catch (e) {
      console.warn('Backend delete post notice (cleaning local cache):', e);
    }

    setData((prev) => ({
      ...prev,
      communityPosts: (prev.communityPosts || []).filter((p) => p.id !== postId)
    }));
    removeUserPostLocally(postId, cleanEmail);
    removeSharedPostLocally(postId);

    // Deep scrub this post from any localStorage stores
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('mindease_user_posts_') || k === STORAGE_KEY || k === SHARED_POSTS_KEY)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              localStorage.setItem(k, JSON.stringify(parsed.filter((p) => p && p.id !== postId)));
            } else if (parsed && parsed.communityPosts && Array.isArray(parsed.communityPosts)) {
              parsed.communityPosts = parsed.communityPosts.filter((p) => p && p.id !== postId);
              localStorage.setItem(k, JSON.stringify(parsed));
            }
          }
        }
      }
    } catch (e) { }
  };

  const toggleLikePost = async (postId) => {
    const cleanEmail = (data.profile?.email || 'alex.morgan@example.com').trim().toLowerCase();
    setData((prev) => {
      const updatedPosts = prev.communityPosts.map((post) => {
        if (post.id === postId) {
          let likedBy = Array.isArray(post.liked_by) ? [...post.liked_by] : [];
          const wasLiked = Boolean(post.isLiked || post.is_liked || (cleanEmail && likedBy.includes(cleanEmail)));
          const nextLiked = !wasLiked;

          if (cleanEmail) {
            if (nextLiked) {
              if (!likedBy.includes(cleanEmail)) likedBy.push(cleanEmail);
            } else {
              likedBy = likedBy.filter((e) => e !== cleanEmail);
            }
          }

          const currentCount = Math.max(post.likeCount || 0, post.likes || 0);
          const previousUserLiked = wasLiked ? 1 : 0;
          const baseLikes = Math.max(0, currentCount - previousUserLiked);
          const newLikeCount = baseLikes + (nextLiked ? 1 : 0);

          const updated = {
            ...post,
            isLiked: nextLiked,
            is_liked: nextLiked,
            liked_by: likedBy,
            likeCount: newLikeCount,
            likes: newLikeCount
          };
          saveSharedPostLocally(updated);
          if (updated.is_owner) {
            saveUserPostLocally(updated, cleanEmail);
          }
          return updated;
        }
        return post;
      });
      return {
        ...prev,
        communityPosts: updatedPosts
      };
    });

    try {
      const res = await apiTogglePostReaction(postId);
      if (res && (res.likeCount !== undefined || res.likes !== undefined)) {
        const backendLikes = res.likeCount !== undefined ? res.likeCount : res.likes;
        const backendLiked = res.isLiked !== undefined ? res.isLiked : res.is_liked;
        setData((prev) => ({
          ...prev,
          communityPosts: prev.communityPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likeCount: backendLikes,
                likes: backendLikes,
                isLiked: backendLiked !== undefined ? backendLiked : post.isLiked,
                is_liked: backendLiked !== undefined ? backendLiked : post.is_liked
              };
            }
            return post;
          })
        }));
      }
    } catch (e) {
      console.warn('Backend reaction sync notice:', e);
    }
  };

  const addCommentToPost = async (postId, commentText, is_anonymous = false) => {
    if (!commentText.trim()) return;
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const isAnon = Boolean(is_anonymous);

    try {
      const res = await apiAddPostComment(postId, commentText, isAnon);
      if (res && res.comment) {
        const sanitizedComment = { ...res.comment, is_owner: true };
        setData((prev) => {
          const updatedPosts = prev.communityPosts.map((post) => {
            if (post.id === postId) {
              const newComments = [...(post.comments || []), sanitizedComment];
              const newCount = Math.max((post.commentCount || 0) + 1, newComments.length);
              const updated = {
                ...post,
                comments: newComments,
                commentCount: newCount
              };
              saveSharedPostLocally(updated);
              if (updated.is_owner) saveUserPostLocally(updated, cleanEmail);
              return updated;
            }
            return post;
          });
          return {
            ...prev,
            communityPosts: updatedPosts
          };
        });
        return sanitizedComment;
      }
    } catch (e) {
      console.warn('Backend add comment error:', e);
    }

    const localComment = {
      id: `comment_${Date.now()}`,
      owner_email: cleanEmail,
      author: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
      author_display: isAnon ? 'Anonymous' : (data.profile?.name || 'Community Member'),
      avatar: isAnon ? '' : (data.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`),
      avatar_url: isAnon ? '' : (data.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`),
      text: commentText,
      content: commentText,
      is_anonymous: isAnon,
      created_at: new Date().toISOString(),
      is_owner: true
    };

    setData((prev) => {
      const updatedPosts = prev.communityPosts.map((post) => {
        if (post.id === postId) {
          const newComments = [...(post.comments || []), localComment];
          const newCount = Math.max((post.commentCount || 0) + 1, newComments.length);
          const updated = {
            ...post,
            comments: newComments,
            commentCount: newCount
          };
          saveSharedPostLocally(updated);
          if (updated.is_owner) saveUserPostLocally(updated, cleanEmail);
          return updated;
        }
        return post;
      });
      return {
        ...prev,
        communityPosts: updatedPosts
      };
    });
    return localComment;
  };

  const deleteCommentFromPost = async (postId, commentId) => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const targetPost = (data.communityPosts || []).find((p) => p.id === postId);
    const targetComment = targetPost?.comments?.find((c) => c.id === commentId);

    if (targetComment && !targetComment.is_owner) {
      console.warn('Blocked attempt to delete comment owned by another user.');
      return;
    }

    try {
      await apiDeletePostComment(commentId);
    } catch (e) {
      console.warn('Backend delete comment error:', e);
    }

    setData((prev) => {
      const updatedPosts = prev.communityPosts.map((post) => {
        if (post.id === postId) {
          const newComments = (post.comments || []).filter((c) => c.id !== commentId);
          const newCount = newComments.length;
          const updated = {
            ...post,
            comments: newComments,
            commentCount: newCount
          };
          saveSharedPostLocally(updated);
          if (updated.is_owner) saveUserPostLocally(updated, cleanEmail);
          return updated;
        }
        return post;
      });
      return {
        ...prev,
        communityPosts: updatedPosts
      };
    });
  };

  const reportContent = async ({ postId, commentId, reason }) => {
    try {
      return await apiReportContent({ postId, commentId, reason });
    } catch (e) {
      console.error('Failed to report content:', e);
      throw e;
    }
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
  const addEmergencyContact = async ({ name, phone, relation }) => {
    const tempId = Date.now();
    const newContact = {
      id: tempId,
      name,
      phone,
      relation
    };

    // Update local React state & user-specific localStorage cache immediately
    setData((prev) => {
      const updated = [...prev.emergencyContacts, newContact];
      const cleanEmail = (prev.profile?.email || '').trim().toLowerCase();
      if (cleanEmail) {
        try {
          localStorage.setItem(`mindease_emergency_contacts_${cleanEmail}`, JSON.stringify(updated));
        } catch (e) { }
      }
      return {
        ...prev,
        emergencyContacts: updated
      };
    });

    // Call backend API to persist to database
    const res = await apiAddEmergencyContact({ name, phone, relation });
    if (res && res.contact) {
      setData((prev) => {
        const updated = prev.emergencyContacts.map((c) =>
          c.id === tempId ? { ...c, id: res.contact.id } : c
        );
        const cleanEmail = (prev.profile?.email || '').trim().toLowerCase();
        if (cleanEmail) {
          try {
            localStorage.setItem(`mindease_emergency_contacts_${cleanEmail}`, JSON.stringify(updated));
          } catch (e) { }
        }
        return {
          ...prev,
          emergencyContacts: updated
        };
      });
    }
  };

  const deleteEmergencyContact = async (contactId) => {
    // Update local React state & user-specific localStorage cache immediately
    setData((prev) => {
      const updated = prev.emergencyContacts.filter((c) => c.id !== contactId);
      const cleanEmail = (prev.profile?.email || '').trim().toLowerCase();
      if (cleanEmail) {
        try {
          localStorage.setItem(`mindease_emergency_contacts_${cleanEmail}`, JSON.stringify(updated));
        } catch (e) { }
      }
      return {
        ...prev,
        emergencyContacts: updated
      };
    });

    // Call backend API to delete from database
    await apiDeleteEmergencyContact(contactId);
  };

  // Mood logging
  const logMood = async (emotion, note = '') => {
    const newLog = {
      id: Date.now(),
      emotion,
      date: new Date().toISOString().split('T')[0],
      note
    };
    setData((prev) => ({
      ...prev,
      moodLogs: [newLog, ...prev.moodLogs],
      profile: { ...prev.profile, streak: (prev.profile.streak || 0) + 1 }
    }));

    await apiLogMood(emotion, note);
    refreshLiveData();
  };

  // Context-aware & anti-repetitive AI fallback response engine adhering to MindEase guidelines
  const generateContextualFallback = (userText, existingMessages = []) => {
    const t = (userText || '').toLowerCase();
    const lastBotMsg = [...existingMessages].reverse().find(m => m.sender === 'bot')?.text || '';

    // 0. TOP PRIORITY: CRISIS SAFETY INTERVENTION
    if (/kill(ing)?\s*(my\s*self|myself)|end\s*(my\s*life|it\s*all)|want\s*to\s*die|suicid|self\s*harm|hurt(ing)?\s*(my\s*self|myself)|harm(ing)?\s*(my\s*self|myself)|take\s*my\s*life|no\s*reason\s*to\s*live|give\s*up\s*on\s*life/i.test(t)) {
      return "🚨 **Emergency & Safety Support**\n\nI hear that you are going through an immense amount of pain right now, but please know that you are not alone and your safety matters deeply.\n\nIf you are having thoughts of suicide, self-harm, or feeling in immediate danger, please reach out to trained, compassionate professionals right now:\n\n• 🇺🇸/🌐 **988 Suicide & Crisis Lifeline**: Call or text **988** (Free, confidential, 24/7)\n• 💬 **Crisis Text Line**: Text **HOME to 741741**\n• 🇬🇭 **Ghana Emergency Services**: Call **112** or **193** | Helpline: **0800 111 222**\n• 🌐 **Global Helplines**: [Find a Helpline](https://findahelpline.com/)\n\nPlease reach out to a trusted loved one, emergency doctor, or crisis line right away. You do not have to carry this alone.";
    }

    // 0. EXACT SHORT MESSAGE HANDLERS (Section 3 & Section 17)
    if (/^(tired|i'm tired|feeling tired|just tired)$/i.test(t)) {
      return "Sounds like you're feeling pretty drained. Was it a long day, or have you been feeling tired for a while?";
    }

    if (/^(calm|i'm calm|feeling calm)$/i.test(t)) {
      return "It's wonderful to have a calm moment. Have you been enjoying a peaceful day or taking time to unwind?";
    }

    if (/^(happy|i'm happy|feeling happy|so happy)$/i.test(t)) {
      return "That's great to hear! 😊 What's been making you feel happy today?";
    }

    if (/^(stressed|i'm stressed|feeling stressed|so stressed)$/i.test(t)) {
      return "It sounds like you've got a lot on your mind. What's been causing the most stress today?";
    }

    if (/^(sad|i'm sad|feeling sad)$/i.test(t)) {
      return "I'm really sorry you're feeling down. Would you like to share what's been on your mind?";
    }

    if (/^(okay|good|fine|i'm good|i'm fine|doing okay)$/i.test(t)) {
      return "Glad to hear things are stable today! How has the rest of your day been going?";
    }

    if (/^(angry|mad|furious)$/i.test(t)) {
      return "It sounds like something really upset you. Would you like to vent about what happened?";
    }

    if (/^(lonely|alone|isolated)$/i.test(t)) {
      return "Feeling lonely can be really tough. I'm right here with you — would you like to talk about what's going on?";
    }

    // 1. SPECIFIC FUNCTIONAL REQUESTS (Highest priority after crisis)
    if (/breath(ing)?\s*(exercise|work|guide|technique)|guide\s*me\s*through\s*(a\s*)?(2-minute\s*)?breath(ing)?|box\s*breath|4-7-8/i.test(t)) {
      return "🫁 **2-Minute Box Breathing Exercise**\n\nLet's take a pause and calm your nervous system together:\n\n1. **Inhale** slowly through your nose for **4 seconds**...\n2. **Hold** your breath for **4 seconds**...\n3. **Exhale** smoothly through your mouth for **4 seconds**...\n4. **Hold** empty for **4 seconds** before inhaling again.\n\nRepeat this cycle 4 times. Focus on the gentle movement of your chest. How does your body feel right now?";
    }

    if (/what\s*can\s*you\s*do\s*(to\s*help)?|how\s*can\s*you\s*help|what\s*are\s*your\s*features|who\s*are\s*you|what\s*can\s*i\s*ask/i.test(t)) {
      return "I'm **MindEase**, your personal AI mental wellness companion! 🌿 Here is how I can support you:\n\n• 🫁 **Guided Relaxation**: 2-minute breathing exercises (Box & 4-7-8 breathing) and physical resets.\n• ⚓ **Grounding Techniques**: 5-4-3-2-1 sensory grounding when feeling overwhelmed or anxious.\n• 💡 **Mindfulness & Coping**: Practical tips for workplace stress, academic pressure, and burnout.\n• 🧠 **Thought Reframing**: Helpful CBT-inspired perspectives to process negative thoughts.\n• 📊 **Mood Tracking**: Log daily moods to track your emotional well-being over time.\n• 🚨 **Emergency Crisis Support**: Instant access to global and local emergency helplines.\n\nWhat would you like to explore or talk through right now?";
    }

    if (/mindful(ness)?\s*(tip|exercise|technique)|workplace\s*stress|mindful/i.test(t)) {
      return "💡 **1-Minute Workplace Mindfulness Tip**\n\nTry the **Single-Task Micro-Pause**:\nBefore switching between tasks or opening a new tab, pause for 60 seconds. Take 3 deep belly breaths, un-clench your jaw, and let your shoulders drop away from your ears.\n\nGiving your body these brief micro-breaks throughout the workday prevents cumulative stress fatigue!";
    }

    if (/grounding\s*(technique|exercise)|5-4-3-2-1|ground\s*me/i.test(t)) {
      return "⚓ **5-4-3-2-1 Grounding Exercise**\n\nLook around your room right now and gently identify:\n\n• **5** things you can see 👁️\n• **4** things you can physically touch ✋\n• **3** things you can hear 👂\n• **2** things you can smell 👃\n• **1** thing you can taste 👅\n\nFocusing on real physical sensations grounds your mind back in the safety of the present moment.";
    }

    // Context inspection across existing message history
    const userHistoryText = existingMessages
      .filter(m => m.sender === 'user')
      .map(m => m.text?.toLowerCase() || '')
      .join(' ');
    const contextText = `${userHistoryText} ${t}`;

    // 2. Job / Employment / Career Context & Short Follow-ups
    if (/job|work|hired|offer|career|employment|internship/i.test(contextText)) {
      if (/software|developer|engineer|dev|code|tech/i.test(t)) {
        return "That's awesome! 🎉 Software engineering is such an exciting field. Is this your first role in software development?";
      }
      return "That's fantastic news! 🎉 Congratulations on the new job! How are you feeling about starting this new chapter?";
    }

    // 3. Positive Emotions & Achievements
    if (/happy|passed|exam|internship|project|graduat|celebrat|promot|awesome|yay|great news|good news|so happy/i.test(t)) {
      const response = "That's fantastic news! 🎉 I'm really glad to hear that! What made today so special?";
      if (lastBotMsg !== response) return response;
    }

    // 4. Academic Pressure & Study Burnout
    if (/study|exam|assignment|class|school|fail|grade|homework|college|university|academic|test/i.test(t)) {
      const response = "Studying when you feel exhausted or worried about grades can make even simple tasks feel overwhelming. It makes total sense that you're feeling this weight.\n\nInstead of trying to force your way through a huge pile of work, here are two simple choices you can pick from right now:\n\n1. **5-Minute Brain Dump**: Write down just 3 specific things you need to do, pick the smallest one, and set a timer for 15 minutes.\n2. **Complete Micro-Pause**: Step away from your desk for 10 minutes, drink a glass of water, and let your brain rest completely without looking at study materials.\n\nWhich of those two options sounds more manageable for you right now?";
      if (lastBotMsg !== response) return response;
    }

    // 5. Relationship Difficulties & Isolation
    if (/friend|partner|boyfriend|girlfriend|family|argument|fight|relationship|breakup|lonely|alone|misunderstand/i.test(t)) {
      const response = "Navigating relationship friction or feeling disconnected from people close to you can take a heavy emotional toll. It is completely natural to feel hurt or unsettled when communication gets difficult.\n\nWhen emotions are raw, here are two gentle ways to handle it:\n\n• **Give yourself emotional space**: Take a short pause before sending messages so you can check in with how you feel first.\n• **Express your core feeling**: Focus on 'I feel...' statements rather than focusing on who was right or wrong.\n\nWould it help to talk through what specifically happened, or would you prefer a quick grounding exercise to ease your stress?";
      if (lastBotMsg !== response) return response;
    }

    // 6. Sleep / Insomnia / Restlessness
    if (/sleep|asleep|bedtime|insomnia|restless|night|waking|can't sleep|struggling to fall/i.test(t)) {
      const response = "Trying to fall asleep while your mind is active or your body is restless can be really frustrating. \n\nHere are two quick options to help signal to your body that it's safe to rest:\n\n• **4-7-8 Breathing**: Inhale silently through your nose for 4s, hold for 7s, and exhale slowly through your mouth for 8s. Repeat 4 times.\n• **Bedside Notepad**: Write down lingering thoughts on paper so your mind doesn't feel responsible for holding onto them overnight.\n\nWould you like me to guide you through a 2-minute relaxation exercise to help you unwind?";
      if (lastBotMsg !== response) return response;
    }

    // 7. Low Mood / Feeling Down / Need to Talk
    if (/low|depress|sad|cry|hopeless|down|unhappy|feeling low|can we talk|talk to me/i.test(t)) {
      const response = "Thank you for reaching out and sharing how you're feeling. Feeling low or drained makes everything feel heavier, but I'm glad you don't have to carry it in silence.\n\nWhen energy is low, keep expectations very gentle. You don't need to fix everything today — taking things one small step at a time is more than enough.\n\nWhat's been on your mind or heart lately?";
      if (lastBotMsg !== response) return response;
    }

    // 8. Anxiety / Panic / Racing Thoughts
    if (/anxiet|anxious|panic|fear|scared|worried|nervous|racing|chest/i.test(t)) {
      const response = "I hear how intense anxiety feels right now. Take a deep, gentle breath with me — you are safe in this moment.\n\nLet's try a quick **5-4-3-2-1 Grounding Technique** to pull your focus back to the present room:\nName **5** things you see, **4** things you can touch, **3** things you hear, **2** things you smell, and **1** thing you taste.\n\nHow does your body feel after taking a moment to focus on your surroundings?";
      if (lastBotMsg !== response) return response;
    }

    // 9. Work Stress / Overwhelm
    if (/stress|overwhelm|burnout|exhaust|work|pressure|busy|heavy/i.test(t)) {
      const response = "It sounds like you're dealing with a lot of pressure right now. When stress builds up, our bodies stay stuck in high-alert mode.\n\nHere are two quick ways to break that stress cycle:\n\n• **Physiological Sigh**: Take two quick inhales through your nose, followed by one long exhale through your mouth. Do this 3 times.\n• **Micro-Prioritization**: Pick just ONE small task to tackle next, and set the rest aside for later.\n\nWhat is the main task or thought weighing on you the most today?";
      if (lastBotMsg !== response) return response;
    }

    // 10. Frustration / Anger / Profanity / Hostility
    if (/fuck|shit|bitch|bastard|shut\s*up|hate\s*you|useless|stfu|crap|dumb|idiot/i.test(t)) {
      const response = "I hear that you're feeling really frustrated or upset right now. It is completely okay to feel angry or annoyed. I'm here if you want to vent about what's bothering you, or we can take a short pause if you need some space.";
      if (lastBotMsg !== response) return response;
    }

    // 11. Short / Casual / Ambiguous Responses
    if (/^(ok|okay|yeah|yep|sure|idk|i don't know|maybe|whatever|meh|fine)$/i.test(t)) {
      const response = "Take all the time you need. I'm right here whenever you'd like to talk through what's on your mind.";
      if (lastBotMsg !== response) return response;
    }

    // 12. Greetings
    if (/^(hi|hello|hey|good morning|good evening|good afternoon|greetings)/i.test(t)) {
      const response = "Hello! 👋 I'm your MindEase companion. How are you doing today?";
      if (lastBotMsg !== response) return response;
    }

    // 13. Thanks / Feeling Better
    if (/thanks|thank you|feel(ing)? better|much better|appreciate/i.test(t)) {
      const response = "I'm really glad to hear you're feeling better! Take the win — you've made it through a tough moment. I'm right here whenever you want to talk.";
      if (lastBotMsg !== response) return response;
    }

    // 14. Non-Canned Fallback Options
    const fallbackPool = [
      "Thank you for sharing that with me. Would you like to tell me a bit more about what you're experiencing today?",
      "I'm listening. What would be most helpful for us to focus on right now?",
      "Take your time. How have things been going for you overall today?"
    ];

    const availableFallbacks = fallbackPool.filter(f => f !== lastBotMsg);
    return availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)];
  };

  const getOrCreateSessionId = () => {
    let sid = localStorage.getItem('mindease_chat_session_id');
    if (!sid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid)) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '12345678-1234-4234-8234-123456789012';
      localStorage.setItem('mindease_chat_session_id', sid);
    }
    return sid;
  };

  // Direct OpenRouter API call fallback for guaranteed AI context retention
  const callDirectOpenRouter = async (messagesHistory, userText) => {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    const modelsToTry = [
      "openrouter/free",
      "liquid/lfm-2.5-2.6b:free",
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-3.5-lightning:free"
    ];

    const systemPrompt = `You are MindEase, a warm, natural, and empathetic conversational companion for mental wellness. You converse like an attentive, caring human friend.
CRITICAL REQUIREMENT: Always maintain exact context of what the user has told you earlier in this session (such as their name, job, feelings, goals, or past messages). Directly refer to their previous details when relevant. Keep normal responses short (1-3 sentences), warm, and natural.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];

    const recentHistory = (messagesHistory || []).slice(-15);
    for (const msg of recentHistory) {
      if (msg.text) {
        formattedMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    if (!formattedMessages.length || formattedMessages[formattedMessages.length - 1].content !== userText) {
      formattedMessages.push({ role: 'user', content: userText });
    }

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mindease.app",
            "X-Title": "MindEase Mental Wellness Companion"
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const reply = resData?.choices?.[0]?.message?.content?.trim();
          if (reply) return reply;
        }
      } catch (err) {
        console.warn(`Direct OpenRouter call failed for model ${model}:`, err);
      }
    }
    return null;
  };

  // Chat message sending connected to API / OpenRouter
  const sendChatMessage = async (userText, language = 'en', tone = 'Empathetic') => {
    if (!userText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setData((prev) => ({
      ...prev,
      chatMessages: [...(prev.chatMessages || []), userMsg]
    }));

    const isCrisisMsg = Boolean(
      /kill(ing)?\s*(my\s*self|myself)|end\s*(my\s*life|it\s*all)|want\s*to\s*die|suicid|self\s*harm|hurt(ing)?\s*(my\s*self|myself)|harm(ing)?\s*(my\s*self|myself)|take\s*my\s*life|no\s*reason\s*to\s*live|give\s*up\s*on\s*life|can'?t\s*breathe|chest\s*pain|heart\s*attack|critical\s*condition|need\s*a?\s*hospital|nearest\s*(hospital|clinic)|emergency\s*help|dying|passing\s*out|overdose/i.test(userText)
    );

    const sessionId = getOrCreateSessionId();

    const currentMessagesWithUser = [...(data.chatMessages || []), userMsg];

    try {
      const apiRes = await apiSendChatMessage(userText, sessionId, language, tone, data.assessmentProfile);
      let botText = "";
      if (apiRes && apiRes.bot_message && (apiRes.bot_message.content || apiRes.bot_message.text)) {
        botText = apiRes.bot_message.content || apiRes.bot_message.text;
      } else if (isCrisisMsg) {
        botText = `🚨 **Emergency & Critical Safety Support**\n\nI hear that you are going through a critical situation right now. Your health and safety matter deeply, and you do not have to handle this alone.\n\n🏥 **FIND NEAREST MEDICAL CARE**:\nIf you require immediate medical or psychiatric assistance, please visit or call the nearest hospital or emergency clinic right away:\n• 📍 Search Nearest Hospital/Clinic: https://www.google.com/maps/search/nearest+hospital+clinic\n\n📞 **CALL EMERGENCY CONTACTS & HELPLINES**:\nPlease connect with emergency services or your saved personal emergency contacts on MindEase:\n• 🇺🇸/🌐 **988 Lifeline**: Call or text 988\n• 💬 **Crisis Text Line**: Text HOME to 741741\n• 🇬🇭 **Ghana Emergency Services**: Call 112 or 193\n• 🌐 **Global Helplines**: https://findahelpline.com/`;
      } else {
        const directOpenRouterReply = await callDirectOpenRouter(currentMessagesWithUser, userText);
        botText = directOpenRouterReply || generateContextualFallback(userText, currentMessagesWithUser);
      }

      const botMsg = {
        id: apiRes?.bot_message?.id || `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        is_crisis: isCrisisMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setData((prev) => ({
        ...prev,
        chatMessages: [...(prev.chatMessages || []), botMsg]
      }));
    } catch (err) {
      console.warn("API call failed, using OpenRouter fallback:", err);
      const directOpenRouterReply = await callDirectOpenRouter(currentMessagesWithUser, userText);
      const botText = directOpenRouterReply || generateContextualFallback(userText, currentMessagesWithUser);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        is_crisis: isCrisisMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setData((prev) => ({
        ...prev,
        chatMessages: [...(prev.chatMessages || []), botMsg]
      }));
    }
  };

  // Clear chat
  const clearChat = () => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const defaultMsg = [
      { id: 1, sender: 'bot', text: "Hello! 👋 I'm your MindEase AI companion. How are you feeling today? You can share anything that's on your mind.", timestamp: '10:00 AM' }
    ];
    setData((prev) => ({
      ...prev,
      chatMessages: defaultMsg,
      pastChatSessions: []
    }));
    if (cleanEmail) {
      try {
        localStorage.removeItem(`mindease_chat_messages_${cleanEmail}`);
        localStorage.removeItem(`mindease_past_sessions_${cleanEmail}`);
        localStorage.removeItem(`mindease_chat_session_${cleanEmail}`);
      } catch (e) { }
    }
  };

  // Start a new fresh chat session with new UUID while preserving old session in history
  const startNewChat = () => {
    const currentMsgs = data.chatMessages || [];
    const userMsgs = currentMsgs.filter((m) => m.sender === 'user');
    const currentSessionId = localStorage.getItem('mindease_chat_session_id') || `session-${Date.now()}`;

    let updatedPastSessions = data.pastChatSessions || [];

    if (userMsgs.length > 0) {
      const firstUserMsg = userMsgs[0]?.text || 'Chat Session';
      const sessionTitle = firstUserMsg.length > 35 ? firstUserMsg.slice(0, 35) + '...' : firstUserMsg;

      const archivedSession = {
        id: currentSessionId,
        title: sessionTitle,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        messages: currentMsgs
      };

      updatedPastSessions = [archivedSession, ...updatedPastSessions.filter((s) => s.id !== currentSessionId)];
    }

    const newSessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : '12345678-1234-4234-8234-' + Date.now().toString().slice(-12);
    localStorage.setItem('mindease_chat_session_id', newSessionId);

    setData((prev) => ({
      ...prev,
      pastChatSessions: updatedPastSessions,
      chatMessages: [
        { id: Date.now(), sender: 'bot', text: "Hello! 👋 I'm your MindEase AI companion. Fresh conversation started! What's on your mind today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    }));
  };

  const loadPastSession = (sessionId) => {
    const session = (data.pastChatSessions || []).find((s) => s.id === sessionId);
    if (session) {
      localStorage.setItem('mindease_chat_session_id', session.id);
      setData((prev) => ({
        ...prev,
        chatMessages: session.messages || []
      }));
    }
  };

  const deletePastSession = (sessionId) => {
    setData((prev) => ({
      ...prev,
      pastChatSessions: (prev.pastChatSessions || []).filter((s) => s.id !== sessionId)
    }));
  };

  const resetAllData = () => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    if (data.communityPosts && Array.isArray(data.communityPosts)) {
      try {
        data.communityPosts.forEach((p) => saveSharedPostLocally(p));
        if (cleanEmail) {
          const userCreated = data.communityPosts.filter((p) => p.is_owner || p.user_id || p.owner_email === cleanEmail);
          if (userCreated.length > 0) {
            const postsKey = `mindease_user_posts_${cleanEmail}`;
            const existing = localStorage.getItem(postsKey);
            let list = existing ? JSON.parse(existing) : [];
            if (!Array.isArray(list)) list = [];
            const existingMap = new Map(list.map((p) => [p.id, p]));
            userCreated.forEach((p) => existingMap.set(p.id, p));
            localStorage.setItem(postsKey, JSON.stringify(Array.from(existingMap.values())));
          }
        }
      } catch (e) { }
    }

    const sharedPosts = getSharedPostsLocally();
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
      communityPosts: sharedPosts
    };
    setData(loggedOutState);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('mindease_auth_token');
      localStorage.removeItem('mindease_chat_session_id');
    } catch (e) { }
  };

  const deleteUserAccount = async (password) => {
    const cleanEmail = (data.profile?.email || '').trim().toLowerCase();
    const currentUserId = String(data.profile?.id || data.profile?.user_id || '').trim();

    await apiDeleteAccount(password);

    if (cleanEmail || currentUserId) {
      try {
        const sharedPostsKey = 'mindease_shared_community_posts';
        const rawShared = localStorage.getItem(sharedPostsKey);
        if (rawShared) {
          const parsed = JSON.parse(rawShared);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (p) =>
                !(p.owner_email && cleanEmail && p.owner_email.trim().toLowerCase() === cleanEmail) &&
                !(p.user_id && currentUserId && String(p.user_id).toLowerCase() === currentUserId.toLowerCase()) &&
                !p.is_owner
            );
            localStorage.setItem(sharedPostsKey, JSON.stringify(cleaned));
          }
        }

        const userKeys = [
          `mindease_user_posts_${cleanEmail}`,
          `mindease_chat_messages_${cleanEmail}`,
          `mindease_past_sessions_${cleanEmail}`,
          `mindease_emergency_contacts_${cleanEmail}`,
          `mindease_daily_checkins_${cleanEmail}`,
          `mindease_user_avatar_${cleanEmail}`,
          `mindease_user_pwd_${cleanEmail}`
        ];
        userKeys.forEach((k) => {
          try { localStorage.removeItem(k); } catch (e) { }
        });
      } catch (e) { }
    }

    resetAllData();
    try {
      localStorage.clear();
    } catch (e) { }
  };

  const completeAssessment = async (answers, result) => {
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

    await apiSubmitAssessment(answers, result);
    refreshLiveData();
  };

  const initNewUserSession = (userData) => {
    const cleanEmail = (userData?.email && typeof userData.email === 'string' && userData.email.includes('@')) ? userData.email.trim().toLowerCase() : '';
    const userIdHint = userData?.id || userData?.user_id || cleanEmail || null;
    const savedAvatar = cleanEmail ? localStorage.getItem(`mindease_user_avatar_${cleanEmail}`) : null;
    const finalAvatar = savedAvatar || userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail || 'newuser'}`;

    if (cleanEmail && finalAvatar) {
      try {
        localStorage.setItem(`mindease_user_avatar_${cleanEmail}`, finalAvatar);
      } catch (e) { }
    }

    // Clear checkins immediately — new user has zero history
    setDailyCheckins([]);
    setUserEnrollments([]);
    try {
      localStorage.removeItem('mindease_chat_session_id');
    } catch (e) { }

    const cleanProfile = {
      name: userData?.name || 'New User',
      email: cleanEmail,
      id: userData?.id || userData?.user_id || null,
      avatar: finalAvatar,
      bio: '',
      streak: 0,
      totalSessions: 0,
      completedProgramsCount: 0,
      badges: [],
      savedResourceIds: [],
      assessmentHistory: [],
    };

    setData((prev) => ({
      ...prev,
      isLoggedIn: true,
      hasCompletedAssessment: false,
      assessmentProfile: null,
      profile: cleanProfile,
      chatMessages: [initialDefaultData.chatMessages[0]],
      pastChatSessions: [],
      moodLogs: [],
      supportTickets: [],
    }));

    if (cleanEmail) {
      refreshEmergencyContacts(cleanEmail);
      refreshUserChatHistory(cleanEmail);
      refreshUserCommunityPosts(cleanEmail);
      // Fetch from Flask — new user will get an empty array
      refreshDailyCheckins(userIdHint);
    }
  };

  const initExistingUserSession = (userData, settingsData) => {
    const cleanEmail = (userData?.email && typeof userData.email === 'string' && userData.email.includes('@')) ? userData.email.trim().toLowerCase() : '';
    const userIdHint = userData?.id || userData?.user_id || cleanEmail || null;
    const savedAvatar = cleanEmail ? localStorage.getItem(`mindease_user_avatar_${cleanEmail}`) : null;
    const activeAvatar = savedAvatar || userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'user'}`;

    if (cleanEmail && activeAvatar) {
      try {
        localStorage.setItem(`mindease_user_avatar_${cleanEmail}`, activeAvatar);
      } catch (e) { }
    }

    // Restore chat history from localStorage (chat is not moving to Flask-only yet)
    let userChatMsgs = [initialDefaultData.chatMessages[0]];
    let userPastSessions = [];

    if (cleanEmail) {
      try {
        const msgsRaw = localStorage.getItem(`mindease_chat_messages_${cleanEmail}`);
        if (msgsRaw) {
          const parsed = JSON.parse(msgsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) userChatMsgs = parsed;
        }
        const pastRaw = localStorage.getItem(`mindease_past_sessions_${cleanEmail}`);
        if (pastRaw) {
          const parsed = JSON.parse(pastRaw);
          if (Array.isArray(parsed)) userPastSessions = parsed;
        }
      } catch (e) { }
    }

    // Clear checkins state immediately — Flask is the source of truth.
    // refreshDailyCheckins() below will populate from Flask/DB.
    // Do NOT pre-load from localStorage here.
    setDailyCheckins([]);
    setUserEnrollments([]);

    setData((prev) => ({
      ...initialDefaultData,
      isLoggedIn: true,
      hasCompletedAssessment: true,
      profile: {
        ...initialDefaultData.profile,
        id: userData?.id || userData?.user_id || null,
        name: userData?.name || 'User',
        email: cleanEmail,
        avatar: activeAvatar,
        bio: userData?.bio !== undefined ? userData.bio : '',
        streak: 0,  // Will be recalculated once checkins load from Flask
        totalSessions: userData?.total_sessions !== undefined ? userData.total_sessions : 0,
      },
      chatMessages: userChatMsgs,
      pastChatSessions: userPastSessions,
      moodLogs: [],
      supportTickets: [],
      communityPosts: prev.communityPosts || [],
      settings: {
        ...initialDefaultData.settings,
        ...(settingsData || {})
      }
    }));

    if (cleanEmail) {
      refreshEmergencyContacts(cleanEmail);
      refreshUserChatHistory(cleanEmail);
      refreshUserCommunityPosts(cleanEmail);
      // Fetch check-ins from Flask DB — userIdHint scopes the localStorage cache only
      refreshDailyCheckins(userIdHint);
      refreshEnrollments(cleanEmail);
    }
  };

  const submitSupportTicket = (ticketData) => {
    const newTicket = {
      id: Date.now(),
      subject: ticketData.subject,
      category: ticketData.category,
      message: ticketData.message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    setData((prev) => ({
      ...prev,
      supportTickets: [newTicket, ...(prev.supportTickets || [])]
    }));
    return newTicket;
  };

  const updateSettings = (newSettings) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const signIn = () => {
    setData((prev) => ({ ...prev, isLoggedIn: true }));
  };

  const enrollUserProgram = async (programId) => {
    const res = await enrollInProgram(programId);
    await refreshEnrollments();
    return res;
  };

  const completeUserActivity = async (programId, activityId, totalActivities = 7) => {
    const res = await completeActivityProgress(programId, activityId, totalActivities);
    await refreshEnrollments();
    return res;
  };

  const syncedPrograms = (data.programs || []).map((p) => {
    const enrollment = (userEnrollments || []).find((e) => String(e.program_id || e.id) === String(p.id));
    if (enrollment) {
      return {
        ...p,
        enrolled: true,
        progress: enrollment.progress_percentage ?? enrollment.progress ?? p.progress ?? 0,
        currentActivity: enrollment.current_activity ?? p.currentActivity ?? 1,
        status: enrollment.status || 'active',
        enrolledAt: enrollment.enrolled_at || p.enrolledAt,
        completedAt: enrollment.completed_at || p.completedAt
      };
    }
    if (p.enrolled) {
      return p;
    }
    return {
      ...p,
      enrolled: false,
      progress: 0,
      currentActivity: 1,
      status: 'not_enrolled'
    };
  });

  return (
    <DataContext.Provider
      value={{
        ...data,
        programs: syncedPrograms,
        userEnrollments,
        enrollUserProgram,
        completeUserActivity,
        refreshEnrollments,
        updateProfile,
        addAssessmentResult,
        completeAssessment,
        toggleEnrollProgram,
        toggleModuleCompletion,
        logActivityMood,
        setActivityReminder,
        createCommunityPost,
        updateCommunityPost,
        deleteCommunityPost,
        toggleLikePost,
        addCommentToPost,
        deleteCommentFromPost,
        reportContent,
        toggleBookmarkResource,
        addEmergencyContact,
        deleteEmergencyContact,
        logMood,
        sendChatMessage,
        clearChat,
        startNewChat,
        loadPastSession,
        deletePastSession,
        submitSupportTicket,
        updateSettings,
        resetAllData,
        deleteUserAccount,
        signIn,
        initNewUserSession,
        initExistingUserSession,
        refreshLiveData,
        dailyCheckins,
        dailyStreak,
        todayCheckin,
        saveDailyCheckin: handleSaveDailyCheckin,
        refreshDailyCheckins
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

