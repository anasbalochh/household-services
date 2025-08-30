import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (roles.length && !roles.includes(role)) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;