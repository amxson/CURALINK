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
    <div className={`card`}>
      <div className={`card-img flex-center`}>
      <img
          src={
            ele.userId.pic ||
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
          }
          alt={`Profile picture of ${ele.userId.firstname || 'anonymous user'}`}
        />

      </div>
      <h3 className="card-name">
        Dr. {ele.userId.firstname + " " + ele.userId.lastname}
      </h3>
      <p className="specialization">
        <strong>Specialization: </strong>
        {ele.specialization}
      </p>
      <p className="experience">
        <strong>Experience: </strong>
        {ele.experience} yrs
      </p>
      <p className="fees">
        <strong>Fees per consultation: </strong>$ {ele.fees}
      </p>
      <p className="phone">
        <strong>Phone: </strong>
        {ele.userId.mobile}
      </p>
      <button
        className="btn appointment-btn"
        onClick={handleModal}
      >
        Book Appointment
      </button>
      {modalOpen && (
        <BookAppointment
          setModalOpen={setModalOpen}
          ele={ele}
        />
      )}
    </div>
  );
};

export default DoctorCard;
