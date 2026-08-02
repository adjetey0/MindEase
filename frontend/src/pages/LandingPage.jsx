import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';

function LandingPage() {
  const { landingStats, testimonials, faqs, profile } = useData();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [featureSearch, setFeatureSearch] = useState('');

  const features = [
    { title: 'Stress Detection & Alerting', desc: 'Real-time analysis of language triggers to mitigate burnout before it escalates.', icon: 'monitor_heart', color: 'bg-rose-500/10 text-rose-600' },
    { title: 'Grounding & Panic Assistance', desc: 'Instant 5-4-3-2-1 sensory exercises to calm your central nervous system.', icon: 'spa', color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Rhythmic Breathwork Guides', desc: '4-7-8 and box breathing animations for instant physical relaxation.', icon: 'air', color: 'bg-sky-500/10 text-sky-600' },
    { title: 'CBT Cognitive Reframing', desc: 'Guided reflections that transform automatic negative thoughts into resilient actions.', icon: 'self_improvement', color: 'bg-amber-500/10 text-amber-600' },
    { title: 'Circadian Sleep Hygiene', desc: 'Wind-down routines, ambient soundscapes, and nighttime relaxation guides.', icon: 'bedtime', color: 'bg-indigo-500/10 text-indigo-600' },
    { title: 'Community Support & Moderation', desc: 'Safe, anonymous peer groups supervised by licensed clinical psychologists.', icon: 'diversity_3', color: 'bg-purple-500/10 text-purple-600' }
  ];

  const filteredFeatures = features.filter((f) =>
    f.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
    f.desc.toLowerCase().includes(featureSearch.toLowerCase())
  );

  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-primary fill-icon">spa</span>
            <span>MindEase</span>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link to="/resources" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Resources</Link>
            <Link to="/programs" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Programs</Link>
            <Link to="/community" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Community</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {profile?.name ? (
            <Link to="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-xs shadow hover:opacity-90 transition">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden md:block text-on-surface-variant hover:text-primary font-body-md text-body-md">Login</Link>
              <Link to="/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-xl pb-xl md:py-28 hero-gradient">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs mb-6 border border-primary/20">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Clinically-Informed Mental Wellbeing Platform</span>
            </div>
            <h1 className="font-headline-xl text-3xl sm:text-5xl md:text-6xl font-bold text-on-surface mb-6 max-w-4xl tracking-tight leading-tight">
              Your Daily Sanctuary for Stress &amp; Anxiety Relief
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl text-sm sm:text-base">
              Manage overwhelm, improve sleep, and build emotional resilience through responsive AI companion support and CBT programs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link to="/chat" className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                <span>Start Free Conversation</span>
                <span className="material-symbols-outlined">forum</span>
              </Link>
              <Link to="/assessment" className="border border-primary text-primary px-8 py-4 rounded-full font-bold hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center text-sm">
                Take 2-Min Assessment
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 mb-14">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCjfJPs0HUmTaq5TRpk7pzjKQ2Jml2OUhJfnZK2di54KAAC1c8RhyTc2IBIi6ygcUVtGdNfoMDikZaZTQPymi7TSk2lWtNu9uFfwcb3vkxALRjR80QWANmXCLfdCZf4Kkq4Yg8b5XCPLho2pIbxSwVTvELWsfddJSlI7Ufbn6ycyqDKYvT8Evge_xnXJmpex71-LEaiLN1I4IDHrmLzx8kK1zjnIkwIbvyah7mAgfgXnajzKSc-p5fOwoOxTwB04PfSGpKEdPEuwO1"
                alt="A serene and minimalist zen garden at dawn with soft pastel blues and lavenders evoking mental clarity"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>

            {/* Dynamic Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-md">
              {landingStats.map((st) => (
                <div key={st.label} className="text-center space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{st.value}</p>
                  <p className="text-[11px] text-on-surface-variant font-semibold">{st.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Features Bento Grid */}
        <section className="py-16 md:py-24 bg-surface-container-low">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="font-headline-lg text-2xl sm:text-4xl font-bold text-on-surface mb-2">Comprehensive Mental Tools</h2>
                <p className="text-on-surface-variant text-sm">Explore our suite of evidence-based wellness features.</p>
              </div>
              <input
                type="text"
                placeholder="Filter tools..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="px-4 py-2 rounded-full bg-surface text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredFeatures.map((feat) => (
                <div key={feat.title} className="p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.color}`}>
                    <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-base">{feat.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Interactive Pricing Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-4xl text-center space-y-8">
            <div>
              <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Simple, Transparent Plans</h2>
              <p className="text-on-surface-variant text-sm">Free tier forever available for basic support.</p>
            </div>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1 bg-surface-container-low rounded-full border border-outline-variant/20">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition ${billingCycle === 'monthly' ? 'bg-primary text-white shadow' : 'text-on-surface-variant'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition ${billingCycle === 'yearly' ? 'bg-primary text-white shadow' : 'text-on-surface-variant'}`}
              >
                Yearly Billing (Save 25%)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
                <h3 className="font-bold text-on-surface text-xl">Free Companion</h3>
                <p className="text-3xl font-bold text-primary">$0 <span className="text-xs font-normal text-on-surface-variant">/ month</span></p>
                <ul className="space-y-2 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ 24/7 AI Chat Assistant</li>
                  <li className="flex items-center gap-2">✓ Daily Mood &amp; Streak Tracker</li>
                  <li className="flex items-center gap-2">✓ Community Forum Access</li>
                  <li className="flex items-center gap-2">✓ Basic 4-7-8 Breathing Tools</li>
                </ul>
                <Link to="/signup" className="block w-full py-3 bg-primary/10 text-primary text-center font-bold text-xs rounded-full hover:bg-primary hover:text-white transition">
                  Get Started Free
                </Link>
              </div>

              <div className="p-8 bg-primary text-white rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold">RECOMMENDED</span>
                <h3 className="font-bold text-xl">MindEase Pro</h3>
                <p className="text-3xl font-bold">{billingCycle === 'monthly' ? '$9.99' : '$7.49'} <span className="text-xs font-normal opacity-80">/ month</span></p>
                <ul className="space-y-2 text-xs opacity-90">
                  <li className="flex items-center gap-2">✓ Everything in Free</li>
                  <li className="flex items-center gap-2">✓ Unlimited Video Guided Sessions</li>
                  <li className="flex items-center gap-2">✓ Complete CBT Wellness Programs</li>
                  <li className="flex items-center gap-2">✓ Priority Specialist Support</li>
                </ul>
                <Link to="/signup" className="block w-full py-3 bg-white text-primary text-center font-bold text-xs rounded-full hover:bg-surface-bright transition shadow">
                  Start Pro Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Testimonials */}
        <section className="py-16 bg-surface-container-low">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-4xl text-center space-y-8">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Trusted by Thousands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {testimonials.map((t) => (
                <div key={t.id} className="p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm space-y-3">
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">"{t.comment}"</p>
                  <div className="flex items-center gap-3 pt-2">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-on-surface text-xs">{t.name}</h4>
                      <p className="text-[10px] text-outline">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic FAQ */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-3xl space-y-6">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 open:shadow-sm">
                  <summary className="font-bold text-on-surface text-sm cursor-pointer list-none flex justify-between items-center">
                    <span>{faq.question}</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition">expand_more</span>
                  </summary>
                  <p className="text-xs text-on-surface-variant mt-3 leading-relaxed border-t border-outline-variant/10 pt-2">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;