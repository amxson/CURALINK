import React from "react";
import LabWorklist from "../components/LabWorklist";
import { FiLogOut, FiDatabase } from "react-icons/fi";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/labdashboard.css";

const LabDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="lab-layout-container">
      {/* Simple, No-Nonsense Header */}
      <header className="lab-header">
        <div className="lab-container">
          <div className="lab-brand">
            <FiDatabase />
            <span>CuraLink Laboratory</span>
          </div>
          <button className="logout-simple-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lab-main-area">
        <div className="lab-container">
          <div className="worklist-section">
            <div className="section-title">
              <h2>Diagnostic Queue</h2>
              <span className="live-tag">LIVE</span>
            </div>
            <LabWorklist />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LabDashboard;
