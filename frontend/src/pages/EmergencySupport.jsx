import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';

const GHANA_CRISIS_LINES = [
  {
    country: 'National Emergency Services',
    flag: '🚨',
    icon: 'emergency',
    lines: [
      { name: '🚨 National Emergency Hotline', number: '112', note: 'Free from all mobile networks' },
      { name: '🚑 National Ambulance Service', number: '193', note: 'Medical emergencies' },
      { name: '👮 Ghana Police Service', number: '191', note: 'Also toll-free: 18555 (MTN & Vodafone)' },
      { name: '🔥 Ghana National Fire Service', number: '192', note: 'Fire & rescue emergencies' },
      { name: '🌊 NADMO (Disaster Management)', number: '029 935 0030', note: 'National Disaster Management Organisation' },
    ],
  },
  {
    country: 'Public Psychiatric Hospitals',
    flag: '🏥',
    icon: 'local_hospital',
    lines: [
      { name: 'Accra Psychiatric Hospital', number: 'Walk-in / Referral', note: 'Accra, Greater Accra Region' },
      { name: 'Pantang Hospital', number: 'Walk-in / Referral', note: 'Pantang, Greater Accra Region' },
      { name: 'Ankaful Psychiatric Hospital', number: 'Walk-in / Referral', note: 'Cape Coast, Central Region' },
    ],
  },
  {
    country: 'Teaching Hospitals with Mental Health Services',
    flag: '🎓',
    icon: 'school',
    lines: [
      { name: 'Korle Bu Teaching Hospital', number: 'Walk-in / Referral', note: 'Psychiatry Dept – Accra' },
      { name: 'Komfo Anokye Teaching Hospital (KATH)', number: 'Walk-in / Referral', note: 'Psychiatry Dept – Kumasi' },
    ],
  },
  {
    country: 'Private Mental Health Clinics',
    flag: '🧠',
    icon: 'psychology',
    lines: [
      { name: 'Aruka Centre', number: 'Schedule Online', note: 'Haatso, Accra – Therapy & Counselling' },
      { name: 'MindX Africa', number: 'Schedule Online', note: 'Tema – Therapy & Counselling' },
      { name: 'Premier Mind & Wellness Clinic', number: 'Schedule Online', note: 'Airport Residential, Accra' },
      { name: 'Helping Minds Ghana', number: 'Schedule Online', note: 'Laterbiokorshie, Accra' },
    ],
  },
];

// Haversine formula – returns distance in km between two lat/lng points
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const INITIAL_FACILITIES = [
  {
    id: 1,
    name: 'Accra Psychiatric Hospital',
    type: 'Public Psychiatric Hospital',
    distance: 'Calculating...',
    hours: 'Open 24/7',
    phone: '030 276 1211',
    address: 'Nyaniba Estates, Osu, Accra',
    lat: 5.5480,
    lng: -0.1895,
    active: true,
  },
  {
    id: 2,
    name: 'Korle Bu Teaching Hospital – Psychiatry',
    type: 'Teaching Hospital',
    distance: 'Calculating...',
    hours: 'Mon–Fri 8am–5pm / 24h Emergency',
    phone: '030 265 1360',
    address: 'Korle Bu, Accra, Greater Accra',
    lat: 5.5418,
    lng: -0.2247,
    active: false,
  },
  {
    id: 3,
    name: 'Pantang Hospital',
    type: 'Public Psychiatric Hospital',
    distance: 'Calculating...',
    hours: 'Open 24/7',
    phone: '030 396 0060',
    address: 'Pantang, Greater Accra Region',
    lat: 5.6833,
    lng: -0.1667,
    active: false,
  },
  {
    id: 4,
    name: 'Aruka Centre',
    type: 'Private Clinic',
    distance: 'Calculating...',
    hours: 'Mon–Sat 8am–6pm',
    phone: '055 900 0000',
    address: 'Haatso, Accra',
    lat: 5.6527,
    lng: -0.2133,
    active: false,
  },
  {
    id: 5,
    name: 'Premier Mind & Wellness Clinic',
    type: 'Private Clinic',
    distance: 'Calculating...',
    hours: 'Mon–Fri 8am–5pm',
    phone: '030 279 4568',
    address: 'Airport Residential Area, Accra',
    lat: 5.6040,
    lng: -0.1637,
    active: false,
  },
  {
    id: 6,
    name: 'Helping Minds Ghana',
    type: 'Private Clinic',
    distance: 'Calculating...',
    hours: 'Mon–Fri 9am–5pm',
    phone: '024 000 0000',
    address: 'Laterbiokorshie, Accra',
    lat: 5.5703,
    lng: -0.2302,
    active: false,
  },
  {
    id: 7,
    name: 'MindX Africa',
    type: 'Private Clinic',
    distance: 'Calculating...',
    hours: 'Mon–Fri 8am–5pm',
    phone: '050 000 0000',
    address: 'Tema, Greater Accra',
    lat: 5.6698,
    lng: -0.0166,
    active: false,
  },
  {
    id: 8,
    name: 'Komfo Anokye Teaching Hospital – Psychiatry',
    type: 'Teaching Hospital',
    distance: 'Calculating...',
    hours: 'Mon–Fri 8am–5pm / 24h Emergency',
    phone: '032 202 2301',
    address: 'Bantama, Kumasi, Ashanti Region',
    lat: 6.6912,
    lng: -1.6228,
    active: false,
  },
  {
    id: 9,
    name: 'Ankaful Psychiatric Hospital',
    type: 'Public Psychiatric Hospital',
    distance: 'Calculating...',
    hours: 'Open 24/7',
    phone: '033 213 3300',
    address: 'Ankaful, Cape Coast, Central Region',
    lat: 5.1167,
    lng: -1.2500,
    active: false,
  },
];

function EmergencySupport() {
  const { hotlines, emergencyContacts, addEmergencyContact, deleteEmergencyContact } = useData();
  const { hash } = useLocation();

  // Scroll to hash anchor (e.g. #local-support) when navigating from another page
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    }
  }, [hash]);

  // 5-4-3-2-1 Grounding state
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (stepNumber) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  // Breathing Guide state & logic
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhaseText, setBreathPhaseText] = useState('Ready?');
  const [breathProgress, setBreathProgress] = useState(0.5);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!isBreathing) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setBreathPhaseText('Ready?');
      setBreathProgress(0.5);
      phaseRef.current = 0;
      return;
    }

    const animateBreathing = () => {
      phaseRef.current += 0.018;
      const sinVal = Math.sin(phaseRef.current);
      const normProgress = (sinVal + 1) / 2;
      setBreathProgress(normProgress);

      if (sinVal > 0.1) {
        setBreathPhaseText('Inhale slowly...');
      } else if (sinVal < -0.1) {
        setBreathPhaseText('Exhale gently...');
      } else {
        setBreathPhaseText('Hold moment...');
      }

      animFrameRef.current = requestAnimationFrame(animateBreathing);
    };

    animFrameRef.current = requestAnimationFrame(animateBreathing);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isBreathing]);

  // Contact modal state
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Live Map State & References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [searchZip, setSearchZip] = useState('');
  const [searchingMap, setSearchingMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Initialize Leaflet Live Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Only init once

    const L = window.L;
    if (!L) return;

    // Create map centered on Accra, Ghana
    const map = L.map(mapContainerRef.current, {
      center: [5.6037, -0.1870],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add Facility Markers
    INITIAL_FACILITIES.forEach((fac) => {
      const marker = L.marker([fac.lat, fac.lng]).addTo(map);

      const popupContent = `
        <div style="font-family: Inter, sans-serif; padding: 4px; max-width: 200px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #121c2a; font-size: 14px;">${fac.name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #424753;">${fac.address}</p>
          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #006c47;">${fac.hours} • ${fac.distance}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #0059ba; color: white; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px; text-decoration: none;">Get Directions</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setFacilities((prev) =>
          prev.map((f) => ({ ...f, active: f.id === fac.id }))
        );
      });

      markersRef.current[fac.id] = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center map on active facility when selected
  const handleSelectFacility = (facility) => {
    setFacilities((prev) =>
      prev.map((f) => ({ ...f, active: f.id === facility.id }))
    );

    if (mapInstanceRef.current && facility.lat && facility.lng) {
      mapInstanceRef.current.setView([facility.lat, facility.lng], 14, {
        animate: true,
      });

      const marker = markersRef.current[facility.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Locate User GPS Position
  const handleLocateUser = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Sort facilities by distance from user and update displayed distances
        setFacilities((prev) =>
          [...prev]
            .map((f) => ({
              ...f,
              distanceKm: getDistanceKm(latitude, longitude, f.lat, f.lng),
              distance: `${getDistanceKm(latitude, longitude, f.lat, f.lng).toFixed(1)} km away`,
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .map((f, idx) => ({ ...f, active: idx === 0 }))
        );

        if (mapInstanceRef.current) {
          const L = window.L;
          mapInstanceRef.current.setView([latitude, longitude], 13, {
            animate: true,
          });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else if (L) {
            const userIcon = L.divIcon({
              className: 'custom-user-pin',
              html: `<div style="background:#ba1a1a;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(186,26,26,0.6);"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: userIcon,
            })
              .addTo(mapInstanceRef.current)
              .bindPopup('<b>📍 Your Current Location</b>')
              .openPopup();
          }
        }
      },
      (err) => {
        setLocationError('Could not retrieve location. Please enable location access and try again.');
      }
    );
  };

  // Search Zip/City with OpenStreetMap Nominatim Geocoding API
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchZip.trim()) return;

    setSearchingMap(true);
    setLocationError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchZip
        )}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 13, { animate: true });
        }

        // Dynamically update facility coordinates relative to searched location
        const updatedFacilities = facilities.map((f, index) => ({
          ...f,
          lat: lat + (index === 0 ? 0.01 : index === 1 ? -0.012 : 0.015),
          lng: lng + (index === 0 ? 0.012 : index === 1 ? 0.018 : -0.015),
        }));

        setFacilities(updatedFacilities);

        // Update markers on map
        const L = window.L;
        if (L && mapInstanceRef.current) {
          updatedFacilities.forEach((fac) => {
            if (markersRef.current[fac.id]) {
              markersRef.current[fac.id].setLatLng([fac.lat, fac.lng]);
            }
          });
        }
      } else {
        setLocationError('No matching location found. Try another city or zip code.');
      }
    } catch (err) {
      setLocationError('Error searching location. Please try again.');
    } finally {
      setSearchingMap(false);
    }
  };

  // Search Ghana crisis directory state
  const [countrySearch, setCountrySearch] = useState('');

  const filteredInternational = GHANA_CRISIS_LINES.filter(
    (item) =>
      item.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
      item.lines.some(
        (l) =>
          l.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          l.number.toLowerCase().includes(countrySearch.toLowerCase()) ||
          (l.note && l.note.toLowerCase().includes(countrySearch.toLowerCase()))
      )
  );

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
    <div className="h-full w-full overflow-y-auto bg-background text-on-background py-8 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-[1100px] mx-auto space-y-12">
        {/* Hero / Immediate Crisis Lifelines */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error-container text-error font-label-sm text-label-sm border border-error/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              CRITICAL SUPPORT AVAILABLE
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-background">
              You are not alone. Help is just a moment away.
            </h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg max-w-full">
              If you are in immediate danger or experiencing a life-threatening crisis, please connect with professional support right now.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-surface p-8 rounded-[2rem] shadow-md border-l-4 border-error space-y-5">

              {/* Primary: Ghana National Emergency */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚨</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Ghana National Emergency Hotline
                  </h3>
                </div>
                <p className="text-on-surface-variant font-label-md text-label-md">
                  Free from all mobile networks. Available 24/7 for any emergency in Ghana.
                </p>
                <a
                  className="w-full bg-error text-on-error flex items-center justify-center gap-3 py-4 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
                  href="tel:112"
                >
                  <span className="material-symbols-outlined">call</span>
                  Call 112 – Emergency Hotline
                </a>
              </div>

              {/* Secondary quick-call grid */}
              <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Other Emergency Numbers
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:193" className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition text-center">
                    <span className="text-xl">🚑</span>
                    <span className="font-bold text-on-surface text-sm">193</span>
                    <span className="text-[10px] text-on-surface-variant">Ambulance</span>
                  </a>
                  <a href="tel:191" className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition text-center">
                    <span className="text-xl">👮</span>
                    <span className="font-bold text-on-surface text-sm">191</span>
                    <span className="text-[10px] text-on-surface-variant">Police</span>
                  </a>
                  <a href="tel:192" className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition text-center">
                    <span className="text-xl">🔥</span>
                    <span className="font-bold text-on-surface text-sm">192</span>
                    <span className="text-[10px] text-on-surface-variant">Fire Service</span>
                  </a>
                  <a href="tel:0299350030" className="flex flex-col items-center gap-1 p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition text-center">
                    <span className="text-xl">🌊</span>
                    <span className="font-bold text-on-surface text-sm">NADMO</span>
                    <span className="text-[10px] text-on-surface-variant">Disaster Mgmt</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Immediate Grounding & Breathing Section */}
        <section className="space-y-6">
          <h2 className="font-headline-lg text-headline-lg text-center text-on-surface">
            Take a moment to ground yourself
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 5-4-3-2-1 Technique Card */}
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">5-4-3-2-1 Technique</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { num: '5', text: 'Things you can ', highlight: 'see' },
                    { num: '4', text: 'Things you can ', highlight: 'touch' },
                    { num: '3', text: 'Things you can ', highlight: 'hear' },
                    { num: '2', text: 'Things you can ', highlight: 'smell' },
                    { num: '1', text: 'Thing you can ', highlight: 'taste' },
                  ].map((step) => {
                    const isDone = !!completedSteps[step.num];
                    return (
                      <div
                        key={step.num}
                        onClick={() => toggleStep(step.num)}
                        className={`flex items-center gap-4 p-3.5 rounded-xl transition-all cursor-pointer border ${isDone
                          ? 'bg-primary-fixed/40 border-primary text-primary'
                          : 'border-transparent hover:bg-surface-container text-on-surface'
                          }`}
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-primary-fixed text-primary font-bold rounded-full text-sm">
                          {step.num}
                        </span>
                        <span className="font-body-md text-body-md flex-1">
                          {step.text}
                          <b>{step.highlight}</b>
                        </span>
                        {isDone && (
                          <span className="material-symbols-outlined text-secondary">
                            check_circle
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-6 text-on-surface-variant font-label-md text-label-md italic">
                Tap each step as you complete it to anchor yourself in the present moment.
              </p>
            </div>

<<<<<<< HEAD
            {/* Breathing Animation Card */}
            <div className="bg-primary-container/10 p-8 rounded-[2rem] border border-primary-container/20 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Deep Breathing Guide</h3>

              {/* Sphere visual */}
              <div className="relative w-full h-64 flex items-center justify-center">
                <div
                  className="absolute rounded-full bg-primary/20 transition-all ease-linear"
                  style={{
                    width: `${140 + breathProgress * 90}px`,
                    height: `${140 + breathProgress * 90}px`,
                    filter: 'blur(20px)',
                  }}
                />
                <div
                  className="rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl transition-all ease-linear duration-75 relative z-10"
                  style={{
                    width: `${120 + breathProgress * 80}px`,
                    height: `${120 + breathProgress * 80}px`,
                    opacity: 0.85 + breathProgress * 0.15,
                  }}
                >
                  <span className="font-bold text-white text-lg drop-shadow-md select-none">
                    {breathPhaseText}
                  </span>
                </div>
=======
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
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
              </div>

              <div className="space-y-4 w-full">
                <p className="text-on-surface-variant font-body-md text-body-md px-4">
                  Follow the sphere. Inhale as it grows, hold at peak, and exhale gently as it shrinks.
                </p>
                <button
                  onClick={() => setIsBreathing((v) => !v)}
                  className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  {isBreathing ? 'Pause Guide' : 'Start Guide'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Guidance & Emergency Contacts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Safety Steps */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/30 h-full space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">security</span>
                Safety Steps for Immediate Crisis
              </h3>

              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-on-background">Find a safe space</p>
                    <p className="text-on-surface-variant font-body-md text-body-md">
                      Move to a room where you feel protected, quiet, and can be alone or with someone you trust.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-on-background">Remove immediate dangers</p>
                    <p className="text-on-surface-variant font-body-md text-body-md">
                      Put away any objects or items that could be used to harm yourself or others.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-on-background">Connect with your support</p>
                    <p className="text-on-surface-variant font-body-md text-body-md">
                      Call your therapist, a trusted friend, or use the 988 hotline or text line buttons above.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Personal Contacts */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm h-full flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    My Emergency Contacts
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddContact((v) => !v);
                      setFormError('');
                    }}
                    className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors flex items-center gap-1 font-label-md text-label-md"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showAddContact ? 'close' : 'add'}
                    </span>
                  </button>
                </div>

                {showAddContact && (
                  <div className="bg-surface-container rounded-2xl p-4 mb-6 border border-outline-variant/30 space-y-3">
                    <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Add Trusted Contact
                    </p>
                    <input
                      type="text"
                      placeholder="Name (e.g. Dr. Aris Thorne)"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-surface-container-lowest rounded-xl px-3.5 py-2 text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-surface-container-lowest rounded-xl px-3.5 py-2 text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. Therapist, Parent)"
                      value={contactForm.relation}
                      onChange={(e) => setContactForm((p) => ({ ...p, relation: e.target.value }))}
                      className="w-full bg-surface-container-lowest rounded-xl px-3.5 py-2 text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
                    />
                    {formError && <p className="text-xs text-error font-medium">{formError}</p>}
                    <button
                      onClick={handleAddContact}
                      className="w-full bg-primary text-white font-bold text-xs py-2 rounded-xl hover:opacity-90 transition"
                    >
                      Save Contact
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {emergencyContacts && emergencyContacts.length > 0 ? (
                    emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
                            <span className="material-symbols-outlined text-xl">person</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-on-background text-sm truncate">{contact.name}</p>
                            <p className="text-on-surface-variant text-label-md truncate">{contact.relation}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-primary material-symbols-outlined hover:bg-primary-fixed/40 p-2 rounded-full transition-colors"
                            title="Call contact"
                          >
                            call
                          </a>
                          <button
                            onClick={() => setShowDeleteConfirm(contact.id)}
                            className="text-error material-symbols-outlined hover:bg-error-container/40 p-2 rounded-full transition-colors opacity-60 group-hover:opacity-100"
                            title="Delete contact"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-surface-container-low rounded-2xl text-center space-y-2">
                      <p className="text-on-surface-variant text-sm">No contacts added yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddContact(true);
                  setFormError('');
                }}
                className="w-full border-2 border-dashed border-outline-variant/50 py-3.5 rounded-2xl text-on-surface-variant font-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Add Emergency Contact
              </button>
            </div>
          </div>
        </section>

        {/* Live Map - Local Support Finder */}
        <section id="local-support" className="bg-surface-variant p-8 md:p-margin-desktop rounded-[3rem] space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-full space-y-3">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Find Local Support</h2>
              <p className="text-on-surface-variant font-body-md text-body-full">
                Interactive live map to locate nearby crisis centers, psychiatric clinics, and emergency mental health facilities.
              </p>
            </div>

            <form onSubmit={handleSearchLocation} className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                  location_on
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary text-sm text-on-surface"
                  placeholder="Enter city or zip code..."
                  type="text"
                  value={searchZip}
                  onChange={(e) => setSearchZip(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={searchingMap}
                className="bg-on-background text-on-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-sm shrink-0 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">search</span>
                {searchingMap ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={handleLocateUser}
                title="Use My GPS Location"
                className="bg-primary text-on-primary p-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shrink-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">my_location</span>
              </button>
            </form>
          </div>

          {locationError && (
            <div className="p-3 bg-error-container/50 text-on-error-container rounded-xl text-xs font-semibold">
              ⚠️ {locationError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Interactive Leaflet Map Container */}
            <div className="lg:col-span-2 rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-lg h-[400px] relative z-0">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute top-4 left-4 z-[400] bg-surface/90 backdrop-blur-md px-4 py-2 rounded-xl border border-outline-variant/20 text-xs font-bold text-on-surface shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Map • Click markers for details
              </div>
            </div>

            {/* Interactive Facility Cards */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => handleSelectFacility(fac)}
                  className={`p-5 rounded-2xl shadow-sm border transition-all cursor-pointer ${fac.active
                    ? 'bg-surface border-primary ring-2 ring-primary/20'
                    : 'bg-surface/70 border-outline-variant/10 opacity-80 hover:opacity-100'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-background text-sm">{fac.name}</h4>
                    {fac.active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{fac.address}</p>
                  <p className="text-on-surface-variant text-label-md mt-1">
                    {fac.distance} • <span className="text-secondary font-semibold">{fac.hours}</span>
                  </p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow bg-primary-fixed text-primary py-2 rounded-lg font-bold text-xs text-center hover:bg-primary-fixed-dim transition flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">directions</span>
                      Get Directions
                    </a>
                    <a
                      href={`tel:${fac.phone}`}
                      className="w-10 bg-surface-container text-on-surface py-2 rounded-lg flex items-center justify-center hover:bg-surface-container-high transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ghana Crisis Lines & Help Centers Directory */}
        <section className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                🇬🇭 Ghana Crisis Lines & Help Centers
              </h2>
              <p className="text-on-surface-variant text-body-md mt-1">
                Official emergency services, psychiatric hospitals, and mental health clinics in Ghana.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-primary text-body-md text-on-surface"
                placeholder="Search service or facility..."
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInternational.map((group) => (
              <div
                key={group.country}
                className="p-6 rounded-2xl bg-surface border border-outline-variant/10 hover:border-primary/30 transition-colors space-y-4"
              >
                <h4 className="font-bold text-primary text-base flex items-center gap-2">
                  <span>{group.flag}</span> {group.country}
                </h4>
                <div className="space-y-3">
                  {group.lines.map((line) => (
                    <div key={line.name} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-on-surface text-sm font-semibold">{line.name}</span>
                        <a
                          href={
                            line.number.match(/^\d[\d\s]+$/) ? `tel:${line.number.replace(/\D/g, '')}` : undefined
                          }
                          className={`font-mono font-bold text-sm ${
                            line.number.match(/^\d[\d\s]+$/)
                              ? 'text-error hover:text-primary underline'
                              : 'text-on-surface-variant'
                          } transition`}
                        >
                          {line.number}
                        </a>
                      </div>
                      {line.note && (
                        <p className="text-[11px] text-on-surface-variant">{line.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal confirm delete contact */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-outline-variant/20 text-center space-y-5">
              <span
                className="material-symbols-outlined text-4xl text-error"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                delete_forever
              </span>
              <div>
<<<<<<< HEAD
                <p className="font-bold text-on-surface text-base">Remove Contact?</p>
                <p className="text-on-surface-variant text-sm mt-1">
                  This contact will be removed from your emergency contact list.
                </p>
=======
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+233 24 000 0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-semibold focus:outline-none"
                />
>>>>>>> f3c8619a2db788a2776707a94a08c94eeb63c82c
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
      </div>
    </div>
  );
}

export default EmergencySupport;