import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaUserMinus, FaFilter, FaEnvelope, FaPhoneAlt, FaUserInjured, FaCalendarCheck, FaChartLine } from "react-icons/fa";
import Loading from "./Loading";
import Empty from "./Empty";
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";
import { RootState } from "../redux/store";
import "../styles/Patients.css";

interface User {
  _id: string;
  pic: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  age: number | string; // Handled as both in case of DB variations
  gender: string;
  role: string;
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllPatients = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const allUsers: User[] = await fetchData("/api/user/getallusers");
      // Safety check: ensure response is an array
      const patientsOnly = (Array.isArray(allUsers) ? allUsers : []).filter(
        (user) => user.role === "Patient"
      );
      setPatients(patientsOnly);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    getAllPatients();
  }, [getAllPatients]);

  // ✅ FIXED: Memoized Calculations to prevent layout shifts or "0" flashes
  const stats = useMemo(() => {
    if (patients.length === 0) return { avgAge: 0, total: 0 };
    const totalAge = patients.reduce((acc, curr) => acc + (Number(curr.age) || 0), 0);
    return {
      total: patients.length,
      avgAge: Math.round(totalAge / patients.length)
    };
  }, [patients]);

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.mobile.includes(search)
    );
  });

  return (
    <section className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h1>Patient Directory</h1>
          <p>Manage and monitor all registered patients</p>
        </div>

        {/* ✅ FIXED LAYOUT: Stats cards are now separate from search for better alignment */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon purple"><FaUserInjured /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Patients</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FaChartLine /></div>
            <div className="stat-info">
              <span className="stat-value">+12</span>
              <span className="stat-label">New This Week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FaCalendarCheck /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.avgAge}</span>
              <span className="stat-label">Avg. Age</span>
            </div>
          </div>
        </div>

        <div className="filter-controls shadow-card">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <FaFilter className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredPatients.length > 0 ? (
        <div className="table-container shadow-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact Info</th>
                <th>Demographics</th>
                <th>Gender</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="patient-row">
                  <td>
                    <div className="patient-profile">
                      <img src={patient.pic || "https://via.placeholder.com/40"} alt="" className="avatar" />
                      <div>
                        <span className="patient-name">{patient.firstname} {patient.lastname}</span>
                        <span className="patient-id">#{patient._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="info-item"><FaEnvelope /> {patient.email}</div>
                      <div className="info-item"><FaPhoneAlt /> {patient.mobile}</div>
                    </div>
                  </td>
                  <td>
                    <div className="age-badge">{patient.age} Years</div>
                  </td>
                  <td>
                    <span className={`gender-tag ${String(patient.gender).toLowerCase()}`}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="delete-action-btn" onClick={() => {/* delete logic */}}>
                      <FaUserMinus />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No patients found matching your search." />
      )}
    </section>
  );
};

export default Patients;
