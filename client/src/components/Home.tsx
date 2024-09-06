import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import fetchData from "../helper/apiCall";
import axios from "axios";
import "../styles/Home.css";
import {
  BsFillGrid3X3GapFill,
} from "react-icons/bs";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

// Define the types for the data structures
interface User {
  id: string;
  name: string;
  // Add other user fields as needed
}

interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  // Add other appointment fields as needed
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  // Add other doctor fields as needed
}

// Type for the Redux state
interface RootState {
  root: {
    loading: boolean;
  };
}

const Home: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [appointmentCount, setAppointmentCount] = useState<number>(0);
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  // Memoize the fetchDataCounts function
  const fetchDataCounts = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const userData = (await fetchData("/api/user/getallusers")) as User[];
      const appointmentData = (await fetchData(
        "/api/appointment/getallappointments"
      )) as Appointment[];
      const doctorData = (await fetchData("api/doctor/getalldoctors")) as Doctor[];

      setUserCount(userData.length);
      setAppointmentCount(appointmentData.length);
      setDoctorCount(doctorData.length);

      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching data counts:", error);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDataCounts();
  }, [fetchDataCounts]); // Now `fetchDataCounts` is a stable dependency

  // Typing the data for the charts
  const data = [
    { name: "User Count", count: userCount },
    { name: "Appointment Count", count: appointmentCount },
    { name: "Doctor Count", count: doctorCount },
  ];

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <div>
            <h1>Welcome To Dashboard!!!</h1>
            <div className="main-cards">
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>USERS</h3>
                  <FaUsers />
                </div>
                <h2 style={{ color: "white" }}>{userCount}</h2>
              </div>
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>APPOINTMENTS</h3>
                  <BsFillGrid3X3GapFill className="card_icon" />
                </div>
                <h2 style={{ color: "white" }}>{appointmentCount}</h2>
              </div>
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>DOCTORS</h3>
                  <FaUserMd />
                </div>
                <h2 style={{ color: "white" }}>{doctorCount}</h2>
              </div>
            </div>
            <div className="charts">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
