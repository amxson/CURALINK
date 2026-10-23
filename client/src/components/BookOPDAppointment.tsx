import AppDialog from "./AppDialog";
// src/components/BookOPDAppointment.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface BookOPDAppointmentProps {
  setModalOpen: (open: boolean) => void;
  doctor: User;
}

const BookOPDAppointment: React.FC<BookOPDAppointmentProps> = ({ setModalOpen, doctor }) => {
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    opdType: "",
    roomNumber: "",
  });

  const inputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({ ...prev, [name]: value }));
  };

  const bookAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formDetails.date || !formDetails.time || !formDetails.opdType || !formDetails.roomNumber) {
      return toast.error("All fields are required");
    }

    try {
      const response = await toast.promise(
        axios.post("/api/appointment/opd/create", {
          doctorId: doctor._id,
          doctorname: `${doctor.firstname} ${doctor.lastname}`,
          date: formDetails.date,
          time: formDetails.time,
          opdType: formDetails.opdType,
          roomNumber: formDetails.roomNumber,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        {
          loading: "Booking OPD appointment...",
          success: "OPD appointment booked!",
          error: "Failed to book OPD appointment",
        }
      );
      setModalOpen(false);
      console.log("Booked:", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppDialog label="Book an OPD appointment" onClose={() => setModalOpen(false)}>
      <div className="modal__content">
        <h2 className="page-heading">Book OPD Appointment</h2>
        <button type="button" aria-label="Close dialog" className="close-btn" onClick={() => setModalOpen(false)}>
          <IoClose />
        </button>

        <form className="register-form" onSubmit={bookAppointment}>
          <input type="date" name="date" value={formDetails.date} onChange={inputChange} />
          <input type="time" name="time" value={formDetails.time} onChange={inputChange} />
          <select name="opdType" value={formDetails.opdType} onChange={inputChange}>
            <option value="">Select OPD Type</option>
            <option value="General">General</option>
            <option value="Specialist">Specialist</option>
          </select>
          <input type="text" name="roomNumber" placeholder="Room Number" value={formDetails.roomNumber} onChange={inputChange} />
          <button type="submit" className="btn form-btn">Book OPD</button>
        </form>
      </div>
    </AppDialog>
  );
};

export default BookOPDAppointment;
