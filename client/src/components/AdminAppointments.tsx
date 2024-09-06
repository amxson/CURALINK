import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

// Define TypeScript interfaces for appointment and state
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
  root: {
    loading: boolean;
  };
}

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllAppoint = async () => {
    try {
      dispatch(setLoading(true));
      const temp: Appointment[] = await fetchData(`/api/appointment/getallappointments`);
      setAppointments(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error(error);
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const complete = async (ele: Appointment) => {
    try {
      await toast.promise(
        axios.put(
          "/api/appointment/completed",
          {
            appointid: ele._id,
            doctorId: ele.doctorId._id,
            doctorname: `${ele.userId.firstname} ${ele.userId.lastname}`,
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

      getAllAppoint();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Appointments</h3>
          {appointments.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Booking Date</th>
                    <th>Booking Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((ele, i) => (
                    <tr key={ele._id}>
                      <td>{i + 1}</td>
                      <td>{`${ele.doctorId.firstname} ${ele.doctorId.lastname}`}</td>
                      <td>{`${ele.userId.firstname} ${ele.userId.lastname}`}</td>
                      <td>{ele.date}</td>
                      <td>{ele.time}</td>
                      <td>{ele.createdAt.split("T")[0]}</td>
                      <td>{ele.updatedAt.split("T")[1].split(".")[0]}</td>
                      <td>{ele.status}</td>
                      <td>
                        <button
                          className={`btn user-btn accept-btn ${
                            ele.status === "Completed" ? "disable-btn" : ""
                          }`}
                          disabled={ele.status === "Completed"}
                          onClick={() => complete(ele)}
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty message="No appointments found." />
          )}
        </section>
      )}
    </>
  );
};

export default AdminAppointments;
