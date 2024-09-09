import "../styles/doctorcard.css";
import React, { useState } from "react";
import BookAppointment from "../components/BookAppointment";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  pic?: string;
  firstname: string;
  lastname: string;
  mobile: string;
}

interface Ele {
  userId: User;
  specialization: string;
  experience: number;
  fees: number;
}

interface DoctorCardProps {
  ele: Ele;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ ele }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");

  const handleModal = () => {
    if (token === "") {
      return toast.error("You must log in first");
    }
    setModalOpen(true);
  };

  return (
    <div className="doctor-card">
      <div className="doctor-card-img">
        <img
          src={
            ele.userId.pic ||
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
          }
          alt={`Profile picture of ${ele.userId.firstname || 'anonymous user'}`}
        />
      </div>
      <div className="doctor-card-info">
        <h3 className="doctor-card-name">
          Dr. {ele.userId.firstname} {ele.userId.lastname}
        </h3>
        <p className="doctor-card-specialization">{ele.specialization}</p>
        <p className="doctor-card-experience">{ele.experience} years of experience</p>
        <div className="doctor-card-rating">
          <span>⭐ 4.0</span> 
          <span>${ele.fees}/hr</span>
        </div>
        <button className="doctor-card-btn" onClick={handleModal}>
          Book Now
        </button>
      </div>
      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

export default DoctorCard;
