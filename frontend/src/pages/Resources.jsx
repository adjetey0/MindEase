import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';
import { ARTICLES, BREATHING_EXERCISES } from '../data/articlesData';

const categories = ['All Resources', 'Anxiety', 'Stress', 'Sleep', 'CBT', 'Mindfulness'];

function Resources() {
  const { toggleMobileMenu } = useLayout();
  const { videoSessions, toggleBookmarkResource, profile } = useData();

  const [activeCategory, setActiveCategory] = useState('All Resources');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeBreathing, setActiveBreathing] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Breathing timer state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0);
  const [totalCyclesDone, setTotalCyclesDone] = useState(0);
  const timerRef = useRef(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveArticle(null);
        setActiveBreathing(null);
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Breathing Timer Effect
  useEffect(() => {
    if (!isBreathingActive || !activeBreathing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const phases = activeBreathing.phases;

    // Start interval
    timerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        setCurrentPhaseIndex((phaseIdx) => {
          const nextIdx = (phaseIdx + 1) % phases.length;
          if (nextIdx === 0) {
            setTotalCyclesDone((c) => c + 1);
          }
          setPhaseSecondsLeft(phases[nextIdx].seconds);
          return nextIdx;
        });

        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBreathingActive, activeBreathing]);

  const handleOpenBreathing = (ex) => {
    setActiveBreathing(ex);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(ex.phases[0].seconds);
    setTotalCyclesDone(0);
    setIsBreathingActive(false);
  };

  const handleToggleBreathingTimer = () => {
    setIsBreathingActive((prev) => !prev);
  };

  const handleResetBreathingTimer = () => {
    setIsBreathingActive(false);
    setCurrentPhaseIndex(0);
    if (activeBreathing) {
      setPhaseSecondsLeft(activeBreathing.phases[0].seconds);
    }
    setTotalCyclesDone(0);
  };

  // Filter articles dynamically based on category & search query
  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCategory =
      activeCategory === 'All Resources' ||
      art.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = filteredArticles[0] || ARTICLES[0];
  const sideArticles = filteredArticles.slice(1, 3);
  const remainingArticles = filteredArticles.slice(3);

  // Helper to format article content markdown text into clean JSX
  const renderArticleContent = (content) => {
    const blocks = content.split('\n\n');
    return blocks.map((block, idx) => {
      const b = block.trim();
      if (b.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-bold text-on-surface mt-8 mb-4">
            {b.replace('## ', '')}
          </h2>
        );
      }
      if (b.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-on-surface mt-6 mb-3">
            {b.replace('### ', '')}
          </h3>
        );
      }
      if (b.startsWith('> ')) {
        return (
          <div key={idx} className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl my-6 text-sm text-on-surface-variant italic">
            {b.replace('> ', '')}
          </div>
        );
      }
      if (b.startsWith('---')) {
        return <hr key={idx} className="border-outline-variant/30 my-8" />;
      }
      if (b.includes('- ')) {
        const items = b.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 text-on-surface-variant text-sm sm:text-base my-4">
            {items.map((it, i) => (
              <li key={i} className="leading-relaxed">
                <span dangerouslySetInnerHTML={{
                  __html: it.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              </li>
            ))}
          </ul>
        );
      }

      // Standard paragraph with bold formatting
      return (
        <p key={idx} className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: b.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }}
        />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-20 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">MindEase</span>
          </div>
        </div>

        {/* Top Navbar Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/resources" className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md">
            Resources
          </Link>
          <Link to="/programs" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">
            Programs
          </Link>
          <Link to="/community" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">
            Community
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="bg-primary text-on-primary px-5 py-2 rounded-full font-label-md hover:opacity-90 transition-all active:scale-95 text-sm"
          >
            Chat Assistant
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <main className="px-margin-mobile md:px-margin-desktop py-8 max-w-[1440px] mx-auto space-y-10">

          {/* Medical Disclaimer Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-on-surface">
            <span className="material-symbols-outlined text-amber-600 shrink-0 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <div className="space-y-0.5">
              <p className="font-bold text-amber-700">Educational & Supportive Content</p>
              <p className="text-on-surface-variant text-xs">
                All articles and exercises provided on MindEase are evidence-informed and created for educational self-care purposes only. This content is not a substitute for professional medical advice, psychiatric diagnosis, or mental health treatment. If you are experiencing a mental health emergency, please use our <Link to="/emergency" className="text-error font-bold hover:underline">Emergency Support</Link> tools immediately.
              </p>
            </div>
          </div>

          {/* Search & Header */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-headline-xl text-[32px] md:text-[40px] leading-[40px] md:leading-[48px] tracking-tight font-bold text-on-surface mb-2">
                  Evidence-Based Resource Library
                </h2>
                <p className="text-on-surface-variant max-w-full text-body-lg">
                  Read clinical guides, practice guided breathwork, and explore evidence-informed articles to support your emotional well-being.
                </p>
              </div>
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-container border-none focus:ring-2 focus:ring-primary/20 text-body-md transition-shadow"
                  placeholder="Search articles, CBT, sleep, stress..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full font-label-md whitespace-nowrap transition-colors ${activeCategory === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* 🧘 Guided Breathing Exercises Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>air</span>
                  Interactive Guided Breathing Exercises
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Scientifically proven breath patterns to rapidly balance your nervous system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BREATHING_EXERCISES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleOpenBreathing(ex)}
                  className={`p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4 relative overflow-hidden`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${ex.bg} ${ex.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-xl">{ex.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {ex.duration}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                        {ex.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-primary text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">play_circle</span> Start Practice
                    </span>
                    <span className="text-[10px] text-outline">{ex.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 📚 Featured & Articles Section */}
          {featured && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface font-bold">
                  Evidence-Informed Articles ({filteredArticles.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Featured Card */}
                <div
                  onClick={() => setActiveArticle(featured)}
                  className="md:col-span-2 group relative h-[380px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${featured.bgUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkResource(featured.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{
                        fontVariationSettings: profile.savedResourceIds.includes(featured.id)
                          ? "'FILL' 1"
                          : "'FILL' 0",
                      }}
                    >
                      bookmark
                    </span>
                  </button>
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white max-w-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold">
                        {featured.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                        {featured.tag}
                      </span>
                    </div>
                    <h4 className="font-headline-lg text-xl sm:text-3xl font-bold mb-2 group-hover:text-primary-container transition-colors">
                      {featured.title}
                    </h4>
                    <p className="text-white/80 line-clamp-2 mb-4 text-xs sm:text-sm">{featured.summary}</p>
                    <div className="flex items-center gap-2 text-xs opacity-90 font-medium">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{featured.readTime}</span>
                      <span>•</span>
                      <span className="underline font-bold text-primary-container">Read full article →</span>
                    </div>
                  </div>
                </div>

                {/* Side Articles Cards */}
                <div className="flex flex-col gap-6">
                  {sideArticles.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setActiveArticle(card)}
                      className="group h-[178px] rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6 flex flex-col justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmarkResource(card.id);
                        }}
                        className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition"
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{
                            fontVariationSettings: profile.savedResourceIds.includes(card.id)
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          bookmark
                        </span>
                      </button>
                      <div>
                        <span className="text-primary font-label-sm uppercase tracking-wider text-[10px] font-bold">
                          {card.category} • {card.tag}
                        </span>
                        <h5 className="font-headline-md text-base font-bold mt-1.5 group-hover:text-primary transition-colors text-on-surface line-clamp-2 pr-6">
                          {card.title}
                        </h5>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-on-surface-variant font-medium">{card.readTime}</span>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-lg">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* More Articles Grid */}
          {remainingArticles.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-headline-md text-xl font-bold text-on-surface">More Recommended Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingArticles.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveArticle(item)}
                    className="flex flex-col justify-between p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="h-44 rounded-2xl overflow-hidden relative">
                        <img
                          src={item.bgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmarkResource(item.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition"
                        >
                          <span
                            className="material-symbols-outlined text-base"
                            style={{
                              fontVariationSettings: profile.savedResourceIds.includes(item.id)
                                ? "'FILL' 1"
                                : "'FILL' 0",
                            }}
                          >
                            bookmark
                          </span>
                        </button>
                        <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur text-white text-[10px] font-bold rounded-lg">
                          {item.category}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1.5">{item.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs">
                      <span className="text-on-surface-variant font-medium">{item.readTime}</span>
                      <span className="text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Video Guided Sessions */}
          <section className="bg-surface-container-low -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop py-12">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Video Guided Sessions
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Click any session to watch and listen to guided video practices.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-2">
                {videoSessions.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideo(vid)}
                    className="min-w-[280px] md:min-w-[340px] flex-shrink-0 group cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow bg-black">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                          <span
                            className="material-symbols-outlined text-primary text-3xl ml-1"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 text-white text-[11px] font-bold rounded-lg font-mono backdrop-blur-sm">
                        {vid.duration}
                      </div>
                    </div>
                    <h6 className="font-label-md text-on-surface font-bold mb-0.5 group-hover:text-primary transition-colors">
                      {vid.title}
                    </h6>
                    <p className="text-xs text-on-surface-variant font-medium">{vid.guide}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* 📖 ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-surface border-b border-outline-variant/20 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">{activeArticle.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmarkResource(activeArticle.id)}
                  className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition"
                  title="Bookmark article"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{
                      fontVariationSettings: profile.savedResourceIds.includes(activeArticle.id)
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    bookmark
                  </span>
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Article Body */}
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Title & Banner */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-on-surface tracking-tight leading-tight">
                  {activeArticle.title}
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant italic border-l-2 border-primary pl-4">
                  {activeArticle.summary}
                </p>
                <div className="h-64 sm:h-80 rounded-2xl overflow-hidden shadow-sm my-6">
                  <img src={activeArticle.bgUrl} alt={activeArticle.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Rendered Content */}
              <div className="prose prose-stone max-w-none">
                {renderArticleContent(activeArticle.content)}
              </div>

              {/* Related articles or CTA */}
              <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low p-6 rounded-2xl">
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Need someone to talk to?</h4>
                  <p className="text-xs text-on-surface-variant">Discuss what you learned with our AI Companion.</p>
                </div>
                <Link
                  to="/chat"
                  onClick={() => setActiveArticle(null)}
                  className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 transition shrink-0"
                >
                  Open AI Companion
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🫁 INTERACTIVE BREATHING TIMER MODAL */}
      {activeBreathing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-full w-full shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col">
            {/* Header */}
            <div className="p-5 bg-surface border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${activeBreathing.bg} ${activeBreathing.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-lg">{activeBreathing.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">{activeBreathing.name}</h3>
                  <p className="text-xs text-on-surface-variant">{activeBreathing.benefit}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveBreathing(null);
                  setIsBreathingActive(false);
                }}
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Timer Visualiser */}
            <div className="p-8 sm:p-10 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-surface-container-lowest to-surface-container-low">

              {/* Pulse Circle */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Outer animated ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${isBreathingActive ? 'scale-110 opacity-30 animate-pulse' : 'scale-100 opacity-20'
                    }`}
                  style={{
                    backgroundColor: activeBreathing.phases[currentPhaseIndex]?.color || '#10b981',
                  }}
                />

                {/* Main Circle */}
                <div
                  className="w-44 h-44 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-1000 transform"
                  style={{
                    backgroundColor: activeBreathing.phases[currentPhaseIndex]?.color || '#10b981',
                    transform: isBreathingActive
                      ? activeBreathing.phases[currentPhaseIndex]?.label.toLowerCase().includes('inhale')
                        ? 'scale(1.15)'
                        : 'scale(0.9)'
                      : 'scale(1.0)',
                  }}
                >
                  <span className="text-2xl font-bold tracking-wide uppercase font-label">
                    {activeBreathing.phases[currentPhaseIndex]?.label}
                  </span>
                  <span className="text-4xl font-extrabold my-1 font-mono">
                    {phaseSecondsLeft}s
                  </span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                    Cycle {totalCyclesDone + 1}
                  </span>
                </div>
              </div>

              {/* Phase Indicators */}
              <div className="flex items-center justify-center gap-2">
                {activeBreathing.phases.map((ph, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${currentPhaseIndex === idx && isBreathingActive
                        ? 'bg-primary text-white scale-105 shadow'
                        : 'bg-surface-container text-on-surface-variant opacity-70'
                      }`}
                  >
                    <span>{ph.label}</span>
                    <span className="text-[10px] opacity-75">({ph.seconds}s)</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleBreathingTimer}
                  className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">
                    {isBreathingActive ? 'pause' : 'play_arrow'}
                  </span>
                  {isBreathingActive ? 'Pause Practice' : 'Start Practice'}
                </button>

                <button
                  onClick={handleResetBreathingTimer}
                  className="p-3.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition active:scale-95"
                  title="Reset timer"
                >
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>

            {/* Written Instructions */}
            <div className="p-6 bg-surface border-t border-outline-variant/20 text-xs text-on-surface-variant space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">How to practice</h4>
              <div className="whitespace-pre-line leading-relaxed">
                {activeBreathing.instructions}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📹 VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 bg-surface flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </span>
                <div>
                  <h3 className="font-bold text-on-surface text-base sm:text-lg leading-tight">
                    {activeVideo.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{activeVideo.guide}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[420px] flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnail}
                controls
                autoPlay
                className="w-full h-full max-h-[500px] object-contain rounded-none"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            <div className="p-6 bg-surface-container-low space-y-4">
              {activeVideo.description && (
                <p className="text-sm text-on-surface-variant leading-relaxed">{activeVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;
