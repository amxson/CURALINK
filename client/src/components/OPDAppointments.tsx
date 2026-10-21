// src/pages/OPDAppointments.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";

interface Appointment {
  _id: string;
  doctorId: {
    firstname: string;
    lastname: string;
  };
  userId: {
    firstname: string;
    lastname: string;
  };
  date: string;
  time: string;
  status: string;
  opdType: string;
  roomNumber: string;
}

const OPDAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/appointment/opd", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch OPD appointments");
      setLoading(false);
    }
  };

  const completeOPD = async (appointmentId: string) => {
    try {
      await axios.patch("/api/appointment/opd/status", {
        appointmentId,
        status: "Completed",
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("OPD marked completed");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update OPD status");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="wrapper">
      <Navbar />
      {loading ? <Loading /> : (
        <section className="container notif-section">
          <h2 className="page-heading">OPD Appointments</h2>
          {appointments.length === 0 ? <Empty message="No OPD appointments" /> :
            appointments.map((apt) => (
              <div className="appointment-card" key={apt._id}>
                <p>Doctor: {apt.doctorId.firstname} {apt.doctorId.lastname}</p>
                <p>Patient: {apt.userId.firstname} {apt.userId.lastname}</p>
                <p>Date: {apt.date}</p>
                <p>Time: {apt.time}</p>
                <p>Type: {apt.opdType}</p>
                <p>Room: {apt.roomNumber}</p>
                <p>Status: {apt.status}</p>
                <button
                  onClick={() => completeOPD(apt._id)}
                  disabled={apt.status === "Completed"}
                >
                  {apt.status === "Completed" ? "Completed" : "Complete"}
                </button>
              </div>
            ))
          }
        </section>
      )}
      <Footer />
    </div>
  );
};

export default OPDAppointments;
