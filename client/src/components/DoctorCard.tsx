import "../styles/doctorcard.css";
import React, { useState } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM for Portal
import BookAppointment from "../components/BookAppointment";
import { toast } from "react-hot-toast";

interface DoctorCardProps {
  ele: any; // Simplified for the example
}

const DoctorCard: React.FC<DoctorCardProps> = ({ ele }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const token = localStorage.getItem("token") || "";

  const handleModal = () => {
    if (!token) return toast.error("Please login to book an appointment");
    setModalOpen(true);
  };

  const firstname = ele.userId?.firstname ?? "Anonymous";
  const lastname = ele.userId?.lastname ?? "";
  const pic = ele.userId?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  return (
    <div className="premium-card">
      <div className="card-header">
        <img src={pic} alt={firstname} className="doctor-avatar" />
        <div className="experience-tag">{ele.experience} Years Exp.</div>
      </div>

      <div className="card-content">
        <span className="specialization-chip">{ele.specialization}</span>
        <h3 className="doctor-fullname">Dr. {firstname} {lastname}</h3>

        <div className="doctor-stats">
          <div className="stat-item">
            <span className="stat-label">Fee</span>
            <span className="stat-value">{ele.fees} ETB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rating</span>
            <span className="stat-value">⭐ 4.8</span>
          </div>
        </div>

        <button className="book-now-btn" onClick={handleModal}>
          Book Appointment
        </button>
      </div>

      {/* RENDER MODAL OUTSIDE THE CARD HIERARCHY */}
      {modalOpen &&
        ReactDOM.createPortal(
          <div className="global-modal-overlay">
             <BookAppointment
               setModalOpen={setModalOpen}
               ele={ele}
             />
          </div>,
          document.body // Teleports to the very end of <body>
        )
      }
    </div>
  );
};

export default DoctorCard;
