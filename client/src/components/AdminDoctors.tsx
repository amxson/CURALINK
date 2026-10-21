import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaUserMd, FaFilter, FaBriefcase, FaMoneyBillWave, FaTrashAlt } from "react-icons/fa";
import Loading from "./Loading";
import Empty from "./Empty";
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";
import "../styles/Patients.css"; // Reuse the shared table styles

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  pic: string;
}

interface Doctor {
  _id: string;
  userId: User;
  experience: string;
  specialization: string;
  fees: string;
}

interface RootState {
  root: { loading: boolean };
}

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  // ✅ FIXED: Better response handling to prevent .filter() errors
  const getAllDoctors = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      let url = "/api/doctor/getalldoctors?limit=1000"; // Fetch all for management

      const response: any = await fetchData(url);

      // Ensure we are setting an ARRAY even if the API returns an object
      const doctorArray = Array.isArray(response) ? response : (response.doctors || []);
      setDoctors(doctorArray);

    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load doctors");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteUser = async (userId: string) => {
    const confirm = window.confirm("Are you sure you want to remove this doctor profile?");
    if (!confirm) return;

    try {
      await toast.promise(
        axios.put(
          "/api/doctor/deletedoctor",
          { userId },
          { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
        ),
        {
          success: "Doctor removed successfully",
          error: "Unable to delete Doctor",
          loading: "Deleting Doctor...",
        }
      );
      getAllDoctors();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, [getAllDoctors]);

  // Modern Universal Search
  const filteredDoctors = doctors.filter((doc) => {
    const search = searchTerm.toLowerCase();
    const nameMatch = `${doc.userId?.firstname} ${doc.userId?.lastname}`.toLowerCase().includes(search);
    const specMatch = doc.specialization.toLowerCase().includes(search);

    if (filter === "firstname") return nameMatch;
    if (filter === "specialization") return specMatch;
    return nameMatch || specMatch; // 'all' searches both
  });

  return (
    <section className="patients-page"> {/* Reusing the page container class */}
      <div className="patients-header">
        <div className="header-left">
          <h1>Medical Staff</h1>
          <p>Manage and monitor clinical specialists</p>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
             <FaFilter className="filter-icon" />
             <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Specialties</option>
                <option value="firstname">By Name</option>
                <option value="specialization">By Specialization</option>
             </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredDoctors.length > 0 ? (
        <div className="table-container shadow-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Specialist</th>
                <th>Expertise</th>
                <th>Experience</th>
                <th>Consultation Fee</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => (
                <tr key={doc._id} className="patient-row">
                  <td>
                    <div className="patient-profile">
                      <img src={doc.userId?.pic} alt="Doctor" className="avatar" />
                      <div>
                        <span className="patient-name">Dr. {doc.userId?.firstname} {doc.userId?.lastname}</span>
                        <span className="patient-id">{doc.userId?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="gender-tag male">{doc.specialization}</span>
                  </td>
                  <td>
                    <div className="info-item"><FaBriefcase style={{color: '#4e73df'}} /> {doc.experience} Years</div>
                  </td>
                  <td>
                    <div className="info-item"><FaMoneyBillWave style={{color: '#1cc88a'}} /> {doc.fees} ETB</div>
                  </td>
                  <td className="text-center">
                    <button className="delete-action-btn" onClick={() => deleteUser(doc.userId?._id)}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No doctors found." />
      )}
    </section>
  );
};

export default AdminDoctors;
