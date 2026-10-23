import AppDialog from "./AppDialog";
import React, { useState, ChangeEvent, FormEvent } from "react";
import "../styles/bookappointment.css";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX, FiCalendar, FiClock, FiMapPin, FiActivity } from "react-icons/fi";

interface BookAppointmentProps {
  setModalOpen: (open: boolean) => void;
  ele: any;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ setModalOpen, ele }) => {
  const [submitting, setSubmitting] = useState(false);
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
    if (submitting) return;
    setSubmitting(true);
    try {
      await toast.promise(
        axios.post(
          "/api/appointment/opd/create",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            doctorname: `Dr. ${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
            opdType: formDetails.opdType,
            roomNumber: formDetails.roomNumber,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        ),
        {
          success: "Appointment booked successfully!",
          error: "Unable to book appointment",
          loading: "Booking in progress...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      console.error("Booking Error:", error);
    } finally { setSubmitting(false); }
  };

  return (
    <AppDialog label="Schedule an appointment" onClose={() => setModalOpen(false)}>
      <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Schedule an appointment</h3>
            <p className="modal-subtitle">Dr. {ele?.userId?.firstname} {ele?.userId?.lastname}</p>
          </div>
          <button aria-label="Close dialog" type="button" className="close-btn" onClick={() => setModalOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <form className="appointment-form" onSubmit={bookAppointment}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><FiCalendar size={14} /> Date</label>
              <input
                type="date"
                name="date"
                min={new Date().toLocaleDateString("en-CA")}
                className="form-input"
                value={formDetails.date}
                onChange={inputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label"><FiClock size={14} /> Time Slot</label>
              <input
                type="time"
                name="time"
                className="form-input"
                value={formDetails.time}
                onChange={inputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><FiActivity size={14} /> OPD Type</label>
            <select
              name="opdType"
              className="form-input"
              value={formDetails.opdType}
              onChange={inputChange}
              required
            >
              <option value="">Choose OPD Category</option>
              <option value="General">General Consultation</option>
              <option value="Specialist">Specialist Review</option>
              <option value="Emergency">Emergency Follow-up</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label"><FiMapPin size={14} /> Room Number (Optional)</label>
            <input
              type="text"
              name="roomNumber"
              className="form-input"
              placeholder="e.g. Wing A, Room 302"
              value={formDetails.roomNumber}
              onChange={inputChange}
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-confirm-booking" disabled={submitting}>
              {submitting ? "Scheduling…" : "Confirm & Schedule"}
            </button>
          </div>
        </form>
      </div>
    </AppDialog>
  );
};

export default BookAppointment;
