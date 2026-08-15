import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';

function LandingPage() {
  const { profile } = useData();

  const howItWorks = [
    {
      icon: 'edit_note',
      title: 'Share Your Thoughts',
      desc: "Type out what's on your mind in our safe, judgement-free chat environment.",
      color: 'bg-primary-container text-on-primary-container',
    },
    {
      icon: 'psychology',
      title: 'AI Understands',
      desc: 'Our empathetic AI analyzes your mood and identifies emotional patterns.',
      color: 'bg-secondary-container text-on-secondary-container',
    },
    {
      icon: 'volunteer_activism',
      title: 'Receive Support',
      desc: 'Get personalized exercises, reflections, and actionable advice instantly.',
      color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    },
  ];

  const features = [
    {
      icon: 'monitor_heart',
      title: 'Stress Detection',
      desc: 'Automatic analysis of language patterns to detect rising stress levels before they become overwhelming.',
      color: 'bg-error-container text-on-error-container',
      span: 'md:col-span-3',
    },
    {
      icon: 'spa',
      title: 'Anxiety Support',
      desc: 'Real-time grounding techniques and anxiety-reduction protocols during periods of high distress.',
      color: 'bg-primary-fixed text-on-primary-fixed-variant',
      span: 'md:col-span-3',
    },
    {
      icon: 'air',
      title: 'Breathing',
      desc: "Guided rhythmic breathing exercises to activate your body's relaxation response.",
      color: 'bg-secondary-container text-on-secondary-container',
      span: 'md:col-span-2',
    },
    {
      icon: 'self_improvement',
      title: 'Mindfulness',
      desc: 'Short, accessible meditation sessions for focus and mental presence.',
      color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      span: 'md:col-span-2',
    },
    {
      icon: 'history_edu',
      title: 'CBT Reflection',
      desc: 'Structured Cognitive Behavioral Therapy tools for reframing negative thought patterns.',
      color: 'bg-surface-container-high text-on-primary-fixed-variant',
      span: 'md:col-span-2',
    },
  ];

  const stats = [
    { value: '500k+', label: 'Users Supported' },
    { value: '12M+', label: 'Sessions Completed' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '24/7', label: 'Active Support' },
  ];

  const faqs = [
    {
      question: 'Is MindEase a replacement for therapy?',
      answer:
        'No, MindEase is designed to complement professional care, not replace it. It provides immediate support and habit tracking, but for clinical conditions, we recommend consulting a licensed therapist.',
    },
    {
      question: 'How secure is my personal data?',
      answer:
        'Your privacy is our priority. All conversations are end-to-end encrypted, and we never sell your data to third parties. We are fully HIPAA and GDPR compliant.',
    },
    {
      question: 'What makes the AI "empathetic"?',
      answer:
        'Our AI models are trained on millions of therapeutic interactions and supervised by psychologists to ensure the tone is supportive, validating, and ethically sound.',
    },
  ];

  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            MindEase
          </Link>
          <div className="hidden md:flex gap-8">
            <Link to="/resources" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              Resources
            </Link>
            <Link to="/programs" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              Programs
            </Link>
            <Link to="/community" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              Community
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {profile?.name ? (
            <Link
              to="/dashboard"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:block text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-xl pb-xl md:py-32 hero-gradient">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm mb-6">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>AI-Powered Mental Health Support</span>
            </div>

            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mb-6 max-w-3xl">
              Your Mental Wellness Companion
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">
              Manage stress, anxiety, and daily challenges with the help of clinically-informed AI. Gentle guidance designed for your emotional well-being.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                to="/chat"
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Start Chatting</span>
                <span className="material-symbols-outlined">chat_bubble</span>
              </Link>
              <Link
                to="/learn-more"
                className="border border-primary text-primary px-8 py-4 rounded-full font-label-md text-label-md hover:bg-primary-fixed transition-all active:scale-95 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Hero Image */}
<<<<<<< HEAD
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20">
=======
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 mb-14">
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCjfJPs0HUmTaq5TRpk7pzjKQ2Jml2OUhJfnZK2di54KAAC1c8RhyTc2IBIi6ygcUVtGdNfoMDikZaZTQPymi7TSk2lWtNu9uFfwcb3vkxALRjR80QWANmXCLfdCZf4Kkq4Yg8b5XCPLho2pIbxSwVTvELWsfddJSlI7Ufbn6ycyqDKYvT8Evge_xnXJmpex71-LEaiLN1I4IDHrmLzx8kK1zjnIkwIbvyah7mAgfgXnajzKSc-p5fOwoOxTwB04PfSGpKEdPEuwO1"
                alt="A serene and minimalist zen garden at dawn with soft pastel blues and lavenders evoking mental clarity"
                className="w-full h-full object-cover"
<<<<<<< HEAD
=======
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
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-xl bg-surface-container-low">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Secure &amp; Private</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Your data is encrypted and anonymized.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant shrink-0">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Evidence-Based</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Built on CBT and mindfulness principles.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Available Anytime</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Support is ready 24/7, whenever you need.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-xl md:py-32 bg-background">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">How MindEase Works</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-full mx-auto">
                Three simple steps to start your journey toward a calmer mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {howItWorks.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-md`}>
                    <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-surface mb-3">{step.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 -right-6 w-12 h-[2px] bg-outline-variant/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-xl md:py-32 bg-surface-container-low">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
                  Comprehensive Tools for Your Mind
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Discover our science-backed features designed to nurture your mental well-being every day.
                </p>
              </div>
              <Link
                to="/resources"
                className="text-primary font-label-md text-label-md flex items-center gap-1 hover:gap-2 transition-all shrink-0"
              >
                View all features <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-gutter">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className={`${feat.span} p-8 bg-surface rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-6`}>
                    <span className="material-symbols-outlined">{feat.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{feat.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-xl bg-primary text-on-primary">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-headline-xl text-headline-xl mb-1">{s.value}</p>
                <p className="font-label-md text-label-md opacity-80 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-xl md:py-32 bg-background">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Frequently Asked Questions</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Have questions? We have answers.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-surface rounded-2xl border border-outline-variant/20 p-6 open:shadow-md transition-all"
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-label-md text-label-md text-on-surface">{faq.question}</span>
                    <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 shrink-0 ml-4">
                      expand_more
                    </span>
                  </summary>
                  <div className="mt-4 font-body-md text-body-md text-on-surface-variant">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl mb-xl">
          <div className="container mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="bg-primary-container text-on-primary-container rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl mb-6">
                  Ready to find your peace?
                </h2>
                <p className="font-body-lg text-body-lg mb-10 opacity-90 max-w-2xl mx-auto">
                  Join thousands of others who are managing their stress and building emotional resilience with MindEase.
                </p>
                <Link
                  to="/signup"
                  className="inline-block bg-surface text-primary px-10 py-5 rounded-full font-label-md text-label-md hover:opacity-95 active:scale-95 transition-all shadow-xl"
                >
                  Start Your Free Trial
                </Link>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;