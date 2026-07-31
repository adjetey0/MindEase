import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const HOTLINE_CATEGORIES = ['All', 'National', 'Text Support', 'Global'];

const SAFETY_TIPS = [
  {
    icon: 'air',
    title: '4-7-8 Breathing',
    desc: 'Inhale for 4 seconds, hold for 7, exhale slowly for 8. Repeat 3-4 times to calm your nervous system instantly.',
    color: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
  },
  {
    icon: 'self_improvement',
    title: '5-4-3-2-1 Grounding',
    desc: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. Brings you back to the present.',
    color: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: 'favorite',
    title: 'Self-Compassion Pause',
    desc: 'Place a hand on your heart. Say: This is a moment of suffering. Suffering is part of life. May I be kind to myself.',
    color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: 'directions_walk',
    title: 'Move Your Body',
    desc: 'Even 5 minutes of walking, stretching, or jumping jacks releases endorphins and shifts your mental state.',
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  },
];

function EmergencySupport() {
  const { hotlines, emergencyContacts, addEmergencyContact, deleteEmergencyContact } = useData();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filteredHotlines =
    activeCategory === 'All'
      ? hotlines
      : hotlines.filter((h) => h.category === activeCategory);

  const handleAddContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.relation.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    addEmergencyContact(contactForm);
    setContactForm({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
    setFormError('');
  };

  const handleDeleteContact = (id) => {
    deleteEmergencyContact(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-full bg-background text-on-background p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 shadow-sm border border-rose-500/20">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
              Emergency Support
            </h1>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              You are not alone. Reach out immediately if you or someone you know needs urgent help.
            </p>
          </div>
        </div>

        {/* Crisis Banner */}
        <div className="mt-6 rounded-2xl bg-rose-600 text-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
          <span className="material-symbols-outlined text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
          <div className="flex-1">
            <p className="font-bold text-base">If you are in immediate danger</p>
            <p className="text-rose-100 text-sm mt-0.5">
              Call your local emergency services (e.g., 911 in the US, 999 in UK) right now. Do not wait.
            </p>
          </div>
          <a
            href="tel:911"
            className="shrink-0 bg-white text-rose-600 font-bold px-5 py-2.5 rounded-full text-sm hover:bg-rose-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">call</span>
            Call Now
          </a>
        </div>
      </div>

      {/* Crisis Hotlines */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              phone_in_talk
            </span>
            Crisis Hotlines
          </h2>
          <div className="flex flex-wrap gap-2">
            {HOTLINE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredHotlines.map((hotline) => (
            <div
              key={hotline.id}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    {hotline.category}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium">{hotline.country}</p>
                  <p className="font-bold text-on-surface text-base mt-0.5 leading-snug">{hotline.name}</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    headset_mic
                  </span>
                </span>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed">{hotline.text}</p>
              <a
                href={hotline.number.includes('.') ? `https://${hotline.number}` : `tel:${hotline.number}`}
                target={hotline.number.includes('.') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-primary text-white font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  {hotline.number.includes('.') ? 'open_in_new' : 'call'}
                </span>
                {hotline.number}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Immediate Coping Strategies */}
      <section className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology_alt
          </span>
          Immediate Coping Strategies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAFETY_TIPS.map((tip) => (
            <div
              key={tip.title}
              className={`rounded-2xl p-5 border flex gap-4 bg-surface-container-lowest shadow-sm ${tip.color}`}
            >
              <span
                className="material-symbols-outlined text-2xl shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {tip.icon}
              </span>
              <div>
                <p className="font-bold text-on-surface text-sm">{tip.title}</p>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Emergency Contacts */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              contacts
            </span>
            My Emergency Contacts
          </h2>
          <button
            onClick={() => { setShowAddContact((v) => !v); setFormError(''); }}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">{showAddContact ? 'close' : 'add'}</span>
            {showAddContact ? 'Cancel' : 'Add Contact'}
          </button>
        </div>

        {showAddContact && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-on-surface">New Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary/60 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary/60 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Relation</label>
                <input
                  type="text"
                  value={contactForm.relation}
                  onChange={(e) => setContactForm((p) => ({ ...p, relation: e.target.value }))}
                  placeholder="e.g. Therapist, Parent"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary/60 transition"
                />
              </div>
            </div>
            {formError && <p className="text-xs text-error font-medium">{formError}</p>}
            <button
              onClick={handleAddContact}
              className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-full hover:opacity-90 transition shadow-sm"
            >
              Save Contact
            </button>
          </div>
        )}

        {emergencyContacts && emergencyContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-bold text-lg">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{contact.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{contact.relation}</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-xs text-primary font-semibold mt-0.5 hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">call</span>
                    {contact.phone}
                  </a>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                    title="Call"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                  </a>
                  <button
                    onClick={() => setShowDeleteConfirm(contact.id)}
                    className="w-8 h-8 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/20 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">contacts</span>
            <p className="text-on-surface-variant text-sm">No emergency contacts added yet.</p>
            <p className="text-xs text-on-surface-variant/70">Add trusted people who can help in a crisis.</p>
          </div>
        )}

        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-outline-variant/20 text-center space-y-5">
              <span className="material-symbols-outlined text-4xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                delete_forever
              </span>
              <div>
                <p className="font-bold text-on-surface text-base">Remove Contact?</p>
                <p className="text-on-surface-variant text-sm mt-1">This contact will be permanently removed from your emergency list.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 border border-outline-variant/30 text-on-surface font-bold py-2.5 rounded-full text-sm hover:bg-surface-container transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteContact(showDeleteConfirm)}
                  className="flex-1 bg-error text-white font-bold py-2.5 rounded-full text-sm hover:opacity-90 transition shadow-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 flex gap-3 items-start">
          <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Important: </strong>
            MindEase is a wellness support tool and is not a substitute for professional medical or psychiatric care. If you or someone else is in immediate danger, please contact emergency services in your area immediately.
          </p>
        </div>
      </section>
    </div>
  );
}

export default EmergencySupport;
