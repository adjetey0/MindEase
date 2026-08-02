import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

function EmergencySupport() {
  const { toggleMobileMenu } = useLayout();
  const { hotlines, emergencyContacts, addEmergencyContact, deleteEmergencyContact } = useData();

  const [countrySearch, setCountrySearch] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Family / Friend');

  // Interactive Grounding Exercise State
  const [groundingStep, setGroundingStep] = useState(0);

  const groundingSteps = [
    { count: 5, sense: 'Things You Can SEE', prompt: 'Look around you right now and name 5 items (e.g., lamp, window, clock).' },
    { count: 4, sense: 'Things You Can TOUCH', prompt: 'Feel 4 physical textures around you (e.g., your desk, clothes, feet on the floor).' },
    { count: 3, sense: 'Things You Can HEAR', prompt: 'Listen closely for 3 ambient sounds (e.g., hum of fan, outdoor birds, breath).' },
    { count: 2, sense: 'Things You Can SMELL', prompt: 'Notice 2 distinct scents around you (e.g., coffee, fresh air, soap).' },
    { count: 1, sense: 'Thing You Can TASTE', prompt: 'Focus on 1 taste in your mouth (or take a quick sip of water).' },
  ];

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    addEmergencyContact({ name: contactName, phone: contactPhone, relation: contactRelation });
    setContactName('');
    setContactPhone('');
    setShowAddContactModal(false);
  };

  const filteredHotlines = hotlines.filter((h) =>
    h.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    h.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    h.number.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-20 w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">MindEase</span>
          </div>
        </div>
        <Link to="/chat" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Chat</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop min-h-0">

          {/* Hero Alert Section */}
          <section className="max-w-[1200px] mx-auto mb-12">
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error/10 text-error font-bold text-xs border border-error/20">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                CRITICAL EMERGENCY SUPPORT AVAILABLE
              </div>
              <h1 className="font-headline-xl text-[32px] md:text-[40px] leading-tight font-bold text-on-surface">
                You are not alone. Help is available 24/7.
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto text-sm">
                If you or someone you know is in immediate crisis, please reach out to one of the free, confidential services below.
              </p>
            </div>

            {/* Primary Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="tel:0800678678"
                className="group flex flex-col items-center justify-center p-10 rounded-[2rem] bg-error text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <span className="material-symbols-outlined text-5xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_share</span>
                <span className="font-headline-md text-2xl font-bold">Call 0800 678 678</span>
                <span className="text-xs mt-2 opacity-90">Ghana Mental Health Authority — free, confidential, 24/7</span>
              </a>

              <a
                href="tel:193"
                className="group flex flex-col items-center justify-center p-10 rounded-[2rem] bg-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <span className="material-symbols-outlined text-5xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>local_police</span>
                <span className="font-headline-md text-2xl font-bold">Call 193 — Emergency Services</span>
                <span className="text-xs mt-2 opacity-90">Police, ambulance, or fire — immediate danger</span>
              </a>
            </div>
          </section>

          {/* Personal Emergency Contacts Section */}
          <section className="max-w-[1200px] mx-auto mb-12 bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">contacts</span>
                  <span>My Personal Emergency Contacts</span>
                </h3>
                <p className="text-xs text-on-surface-variant">Trusted individuals you can call during moments of overwhelm.</p>
              </div>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Contact</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{c.name}</h4>
                    <p className="text-xs text-primary font-semibold">{c.phone}</p>
                    <span className="text-[10px] text-outline">{c.relation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${c.phone}`} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition" title="Call">
                      <span className="material-symbols-outlined text-lg">call</span>
                    </a>
                    <button onClick={() => deleteEmergencyContact(c.id)} className="p-2 rounded-xl hover:bg-error/10 text-error transition" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive 5-4-3-2-1 Grounding Tool */}
          <section className="max-w-[1200px] mx-auto mb-12 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 p-8 rounded-[2rem] border border-outline-variant/20 space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">self_improvement</span>
              <div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Interactive Grounding Exercise</h3>
                <p className="text-xs text-on-surface-variant">Step-by-step sensory grounding to slow down anxiety.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 text-center space-y-4">
              <div className="inline-block w-14 h-14 rounded-full bg-primary text-white font-bold text-2xl leading-[56px]">
                {groundingSteps[groundingStep].count}
              </div>
              <h4 className="font-bold text-on-surface text-lg">{groundingSteps[groundingStep].sense}</h4>
              <p className="text-on-surface-variant text-sm max-w-full mx-auto">{groundingSteps[groundingStep].prompt}</p>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  disabled={groundingStep === 0}
                  onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
                  className="px-5 py-2 border rounded-full text-xs font-bold disabled:opacity-30"
                >
                  Previous Step
                </button>
                <button
                  disabled={groundingStep === groundingSteps.length - 1}
                  onClick={() => setGroundingStep((prev) => Math.min(groundingSteps.length - 1, prev + 1))}
                  className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold shadow hover:opacity-90 disabled:opacity-30"
                >
                  Next Step ({groundingStep + 1}/{groundingSteps.length})
                </button>
              </div>
            </div>
          </section>

          {/* Dynamic Hotlines Directory */}
          <section className="max-w-[1200px] mx-auto bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Global Crisis Helplines</h3>
                <p className="text-xs text-on-surface-variant">Browse or search emergency lifelines worldwide.</p>
              </div>
              <input
                type="text"
                placeholder="Search country or service..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full md:w-64 px-4 py-2 rounded-full bg-surface-container-low text-xs border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHotlines.map((h) => (
                <div key={h.id} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{h.country}</span>
                    <h4 className="font-bold text-on-surface text-sm">{h.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{h.text}</p>
                  </div>
                  <a href={`tel:${h.number}`} className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:opacity-90 transition shadow">
                    Call
                  </a>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Add Emergency Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md font-bold text-on-surface text-lg">Add Emergency Contact</h3>
              <button onClick={() => setShowAddContactModal(false)} className="p-1 text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Watson or Mom"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+233 24 000 0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Therapist, Brother, Friend"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:opacity-90 shadow"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencySupport;