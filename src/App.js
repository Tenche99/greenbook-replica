import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Use Navigate for redirects
import './App.css';
import PrivateRoute from './PrivateRoute'; // Ensure PrivateRoute works for protected routes

const LoginPage = lazy(() => import('./Components/LoginPage'));
const Home = lazy(() => import('./Home/Home'));
const Sarso = lazy(() => import('./Sarso/Sarso'));

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); // Authentication check

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Default root path, redirect based on authentication */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Login page route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Home page route */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />

          {/* Another protected route (PageLoginBasic) */}
          <Route
            path="/Sarso"
            element={
              <PrivateRoute>
                <Sarso />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
