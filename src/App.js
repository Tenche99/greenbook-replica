import React, { Suspense, lazy } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom"; // Use Navigate for redirects
import Norchoe from "../src/Norchoe/Norchoe";
import AddSarsoMadeb from "../src/Sarso/AddSarsoMadeb";
import Sarso from "../src/Sarso/Sarso";
import "./App.css";
import PrivateRoute from "./PrivateRoute"; // Ensure PrivateRoute works for protected routes

const LoginPage = lazy(() => import("./Components/LoginPage"));
const Home = lazy(() => import("./Home/Home"));
//const Sarso = lazy(() => import("./Sarso/Sarso"));
//const Norchoe = lazy(() => import("./Norchoe/Norchoe"));

const App = () => {
  const isAuthenticated = !!localStorage.getItem("token"); // Authentication check

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Default root path, redirect based on authentication */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
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
          <Route
            path="/Sarso/AddSarsoMadeb"
            element={
              <PrivateRoute>
                <AddSarsoMadeb />
              </PrivateRoute>
            }
          />
          <Route
            path="/madeb/Norchoe"
            element={
              <PrivateRoute>
                <Norchoe />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
