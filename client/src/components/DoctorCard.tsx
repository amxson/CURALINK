import "../styles/doctorcard.css";
import React, { useState } from "react";
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
        <img src={pic} alt={`Dr. ${firstname} ${lastname}`} className="doctor-avatar" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect width="160" height="160" fill="%23e0f2fe"/%3E%3Ccircle cx="80" cy="55" r="25" fill="%2364748b"/%3E%3Cpath d="M30 150a50 55 0 0 1 100 0" fill="%2364748b"/%3E%3C/svg%3E'; }} />
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

      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

export default DoctorCard;
