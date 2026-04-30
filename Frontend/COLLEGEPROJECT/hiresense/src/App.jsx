import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import CandidateDashboard from "./pages/CandidateDashboard";
import HRDashboard from "./pages/HRDashboard";
import BackupPage from "./pages/BackupPage";
import ResumeScreener from "./components/ResumeScreener";
import AboutPage from "./pages/AboutPage";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {!isHomePage && <Navbar />}
      <div className={isHomePage ? "" : "pt-20"}> {/* Add padding top so navbar doesn't overlap content */}
        <Routes>
          {/* MAIN */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARDS - PROTECTED */}
          <Route
            path="/candidate-dashboard"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute allowedRole="hr">
                <HRDashboard />
              </ProtectedRoute>
            }

          />

          {/* BACKUP */}
          <Route path="/backup" element={<BackupPage />} />

          {/* STANDALONE SCREENER */}
          <Route path="/screener" element={<ResumeScreener />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
