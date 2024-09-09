import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import { toast } from "react-hot-toast";
import {jwtDecode} from "jwt-decode"; // Fixed import
import axios from "axios";
import "../styles/appoint.css";
import { RootState } from "../redux/store";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    firstname: string;
    lastname: string;
    pic: string;
  };
  userId: {
    firstname: string;
    lastname: string;
    pic: string;
  };
  date: string;
  status: string;
}

interface DecodedToken {
  userId: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PerPage = 9;
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const token = localStorage.getItem("token") || "";
  const { userId } = jwtDecode<DecodedToken>(token);

  const getAllAppoint = async () => {
    try {
      dispatch(setLoading(true));
      const temp: Appointment[] = await fetchData(
        `/api/appointment/getallappointments?search=${userId}`
      );
      setAppointments(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    }
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const totalPages = Math.ceil(appointments.length / PerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * PerPage,
    currentPage * PerPage
  );

  const completeAppointment = async (appointment: Appointment) => {
    try {
      await axios.put(
        "/api/appointment/completed",
        {
          appointid: appointment._id,
          doctorId: appointment.doctorId._id,
          doctorname: `${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Appointment completed successfully.");
      getAllAppoint();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment. Please try again.");
    }
  };

  return (
    <div className="wrapper">
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>

          {appointments.length > 0 ? (
            <div className="appointments">
              {paginatedAppointments.map((appointment) => (
                <div className="appointment-card" key={appointment._id}>
                  <div className="patient-info">
                    <div className="patient-card-img">
                      <img
                        src={appointment.userId.pic}
                        alt={`${appointment.userId.firstname} ${appointment.userId.lastname}`}
                      />
                    </div>
                    <div className="patient-card-info">
                      <h3>{`${appointment.userId.firstname} ${appointment.userId.lastname}`}</h3>
                      <p>{`Doctor: ${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`}</p>
                      <p>Booked for: {new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="status-complete">
                    <p className="status">{appointment.status}</p>
                    <button
                      className="complete-btn"
                      onClick={() => completeAppointment(appointment)}
                      disabled={appointment.status === "Completed"}
                    >
                      {appointment.status === "Completed" ? "Completed" : "Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="No appointments available" />
          )}

          <div className="pagination">{renderPagination()}</div>
        </section>
      )}
      <Footer />
    </div>
  );
};

export default Appointments;
