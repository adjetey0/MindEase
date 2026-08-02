import React from 'react';
import { Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Wrap any route element with this to require the user to be logged in.
// Checks profile.name from DataContext (set by Login/Signup on success).
// If no profile is set, redirects to /login instead of rendering the page.
function ProtectedRoute({ children }) {
  const { profile } = useData();

  if (!profile?.name) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;