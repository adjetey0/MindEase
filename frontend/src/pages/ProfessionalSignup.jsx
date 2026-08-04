import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE from '../utils/api';

const API_BASE_URL = API_BASE;

const CREDENTIAL_TYPES = [
  'Licensed Clinical Psychologist',
  'Licensed Counsellor',
  'Psychiatrist',
  'Licensed Social Worker',
  'Marriage and Family Therapist',
  'Other',
];

function ProfessionalSignup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [credentialType, setCredentialType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [bio, setBio] = useState('');
  const [document, setDocument] = useState(null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) {
        setErrorMessage('Please upload a PDF, JPG, or PNG file.');
        return;
      }
      setErrorMessage('');
      setDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) return;
    if (!document) {
      setErrorMessage('Please upload a credential document (license or certification).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('full_name', fullName);
    formData.append('credential_type', credentialType);
    formData.append('license_number', licenseNumber);
    formData.append('issuing_body', issuingBody);
    formData.append('years_experience', yearsExperience);
    formData.append('specializations', specializations);
    formData.append('bio', bio);
    formData.append('credential_document', document);

    try {
      const response = await fetch(`${API_BASE_URL}/api/professional/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMessage('Could not reach the server. Is your backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-surface-container-lowest px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Application submitted</h1>
        <p className="text-on-surface-variant text-sm max-w-[420px] mb-8">
          Thanks for applying to join MindEase as a professional. Our team will review your
          credentials before your account goes live — this usually takes a few days. We'll
          notify you by email once you're approved.
        </p>
        <Link
          to="/"
          className="text-primary text-sm font-semibold hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-on-background">
      {/* Left Image Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80"
          alt="Counsellor supporting a client"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <Link to="/" className="absolute top-8 left-8 z-10 flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-lg fill-icon">spa</span>
          </div>
          <span className="text-[22px] font-bold text-white tracking-tight drop-shadow-lg">MindEase</span>
        </Link>

        <div className="absolute bottom-10 left-8 right-8 z-10 space-y-2">
          <h2 className="text-3xl xl:text-[38px] leading-[1.15] font-bold text-white tracking-tight drop-shadow-lg">
            Help someone find<br />
            <span className="text-primary-fixed">their calm.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-full drop-shadow">
            Join our network of qualified professionals supporting people through MindEase.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface-container-lowest px-6 py-16 sm:px-10 md:px-16 relative overflow-hidden">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link to="/" className="lg:hidden font-bold text-xl text-primary tracking-tight">MindEase</Link>
          <Link to="/" className="hidden lg:flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/staff-portal-x7k9d" className="text-primary text-sm font-semibold hover:underline">
            Log In
          </Link>
        </div>

        <div className="w-full max-w-[460px] space-y-6 animate-slide-up my-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Apply as a professional 🩺</h1>
            <p className="text-on-surface-variant text-sm">
              Strictly for qualified, licensed mental health professionals. Applications are
              reviewed before your account goes live.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-error-container/40 border border-error/30 text-error text-sm rounded-xl px-4 py-3">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic info */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-semibold text-on-surface">
                Full Name
              </label>
              <input
                required
                id="fullName"
                type="text"
                placeholder="Dr. Ama Boateng"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-on-surface">
                Email Address
              </label>
              <input
                required
                id="email"
                type="email"
                placeholder="ama.boateng@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="h-px bg-outline-variant/40 my-2" />

            {/* Credentials */}
            <div className="space-y-1.5">
              <label htmlFor="credentialType" className="block text-sm font-semibold text-on-surface">
                Professional Credential
              </label>
              <select
                required
                id="credentialType"
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              >
                <option value="" disabled>Select your credential type</option>
                {CREDENTIAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-on-surface">
                  License Number
                </label>
                <input
                  required
                  id="licenseNumber"
                  type="text"
                  placeholder="GH-12345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="yearsExperience" className="block text-sm font-semibold text-on-surface">
                  Years Experience
                </label>
                <input
                  required
                  id="yearsExperience"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="issuingBody" className="block text-sm font-semibold text-on-surface">
                Issuing Body
              </label>
              <input
                required
                id="issuingBody"
                type="text"
                placeholder="Ghana Psychological Council"
                value={issuingBody}
                onChange={(e) => setIssuingBody(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="specializations" className="block text-sm font-semibold text-on-surface">
                Specializations
              </label>
              <input
                id="specializations"
                type="text"
                placeholder="depression, anxiety, trauma (comma-separated)"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="block text-sm font-semibold text-on-surface">
                Short Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Tell users a little about your approach and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded-xl px-4 py-3.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="document" className="block text-sm font-semibold text-on-surface">
                Credential Document
              </label>
              <label
                htmlFor="document"
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-outline-variant/60 rounded-xl px-4 py-6 text-sm text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">upload_file</span>
                <span>{document ? document.name : 'Upload license or certification (PDF, JPG, PNG)'}</span>
              </label>
              <input
                required
                id="document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                required
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant cursor-pointer leading-relaxed">
                I confirm the credentials provided are accurate and I agree to the Terms of
                Service &amp; Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-98 transition-all shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              {!isSubmitting && <span className="material-symbols-outlined text-base">arrow_forward</span>}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Not a professional?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up as a user
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalSignup;