import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Programs from './pages/Programs';
import Community from './pages/Community';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfessionalSignup from './pages/ProfessionalSignup';
import ProfessionalLogin from './pages/ProfessionalLogin';
import AdminDashboard from './pages/AdminDashboard';
import LearnMore from './pages/LearnMore';
import EmergencySupport from './pages/EmergencySupport';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Assessment from './pages/Assessment';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/staff-application-kn74x" element={<ProfessionalSignup />} />
      <Route path="/staff-portal-x7k9d" element={<ProfessionalLogin />} />
      <Route path="/control-panel-q92j" element={<AdminDashboard />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/community" element={<Community />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/emergency" element={<EmergencySupport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
  );
}


export default App;