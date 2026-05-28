import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLocal } from '../context/LocalContext';

function ProtectedRoute({ children }) {
  const { authUser } = useLocal();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
