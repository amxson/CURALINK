import React, { useState, ChangeEvent, FormEvent } from "react";
import "../styles/bookappointment.css";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface Ele {
  userId?: User;
}

interface BookAppointmentProps {
  setModalOpen: (open: boolean) => void;
  ele: Ele;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ setModalOpen, ele }) => {
  const [formDetails, setFormDetails] = useState<{ date: string; time: string }>({
    date: "",
    time: "",
  });

  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const bookAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.post(
          "/api/appointment/bookappointment",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment booked successfully",
          error: "Unable to book appointment",
          loading: "Booking appointment...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Unable to book appointment");
    }
  };

  return (
    <>
      <div className="modal flex-center">
        <div className="modal__content">
          <h2 className="page-heading">Book Appointment</h2>
          <IoMdClose
            onClick={() => setModalOpen(false)}
            className="close-btn"
          />
          <div className="register-container flex-center book">
            <form className="register-form" onSubmit={bookAppointment}>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formDetails.date}
                onChange={inputChange}
              />
              <input
                type="time"
                name="time"
                className="form-input"
                value={formDetails.time}
                onChange={inputChange}
              />
              <button
                type="submit"
                className="btn form-btn"
              >
                Book
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
