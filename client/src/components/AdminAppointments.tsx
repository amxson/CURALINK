import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FaCalendarAlt, FaClock, FaUserMd, FaUserInjured, FaCheckCircle } from "react-icons/fa";
import Loading from "./Loading";
import Empty from "./Empty";
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";
import "../styles/Patients.css"; // Using consistent shared styles

interface Doctor {
  _id: string;
  firstname: string;
  lastname: string;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  userId: User;
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface RootState {
  root: { loading: boolean };
}

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllAppoint = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response: any = await fetchData(`/api/appointment/getallappointments`);

      // Safety check: ensure we handle object vs array responses
      const appointArray = Array.isArray(response) ? response : (response.appointments || []);
      const sortedAppointments = [...appointArray].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    getAllAppoint();
  }, [getAllAppoint]);

  const complete = async (ele: Appointment) => {
    try {
      await toast.promise(
        axios.put(
          "/api/appointment/completed",
          {
            appointid: ele._id,
            doctorId: ele.doctorId._id,
            doctorname: `${ele.doctorId.firstname} ${ele.doctorId.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment marked as completed!",
          error: "Unable to update status",
          loading: "Updating status...",
        }
      );
      getAllAppoint();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h1>Appointment Manager</h1>
          <p>Track and manage patient-doctor consultations</p>
        </div>

        <div className="header-actions">
           <div className="stats-mini-badge">
             Total: <strong>{appointments.length}</strong>
           </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : appointments.length > 0 ? (
        <div className="table-container shadow-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Participants</th>
                <th>Schedule</th>
                <th>Booking Ref</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((ele) => (
                <tr key={ele._id} className="patient-row">
                  <td>
                    <div className="appointment-users">
                      <div className="info-item">
                        <FaUserMd style={{color: '#4e73df'}} />
                        <span className="doc-name">Dr. {ele.doctorId?.firstname} {ele.doctorId?.lastname}</span>
                      </div>
                      <div className="info-item">
                        <FaUserInjured style={{color: '#1cc88a'}} />
                        <span className="patient-subtext">{ele.userId?.firstname} {ele.userId?.lastname}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="schedule-box">
                      <div className="info-item"><FaCalendarAlt /> {ele.date}</div>
                      <div className="info-item"><FaClock /> {ele.time}</div>
                    </div>
                  </td>
                  <td>
                    <div className="booking-info">
                      <span className="id-badge">#{ele._id.slice(-6).toUpperCase()}</span>
                      <p className="timestamp">{ele.createdAt.split("T")[0]}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`gender-tag ${ele.status.toLowerCase() === 'completed' ? 'male' : 'pending-tag'}`}>
                      {ele.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className={`complete-btn ${ele.status === "Completed" ? "btn-done" : ""}`}
                      disabled={ele.status === "Completed"}
                      onClick={() => complete(ele)}
                    >
                      {ele.status === "Completed" ? <FaCheckCircle /> : "Complete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No appointments scheduled." />
      )}
    </section>
  );
};

export default AdminAppointments;
