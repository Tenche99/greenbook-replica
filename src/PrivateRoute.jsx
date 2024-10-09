import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection

const PrivateRoute = ({ children }) => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem('token');

    // If no token is found, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists, allow access to the component
    return children;
};

export default PrivateRoute;
