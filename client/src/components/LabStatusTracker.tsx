import React from "react";
import { FiClock, FiActivity, FiCheckCircle, FiPackage } from "react-icons/fi";
import "../styles/tracker.css";

const LabStatusTracker = ({ status }: { status: string }) => {
  const steps = [
    { label: "Pending", icon: <FiClock />, key: "pending" },
    { label: "Processing", icon: <FiActivity />, key: "in progress" },
    { label: "Ready", icon: <FiCheckCircle />, key: "ready" },
    { label: "Collected", icon: <FiPackage />, key: "collected" },
  ];

  const currentIdx = steps.findIndex(s => s.key === status.toLowerCase());

  return (
    <div className="tracker-wrapper">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className={`step-item ${index <= currentIdx ? "active" : ""}`}>
            <div className="step-icon">{step.icon}</div>
            <span className="step-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-line ${index < currentIdx ? "active" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LabStatusTracker;
