import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FaCheck, FaTimes, FaBriefcase, FaMoneyBillWave, FaEnvelope } from "react-icons/fa";
import Loading from "./Loading";
import Empty from "./Empty";
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";
import "../styles/Patients.css"; // Reuse your shared high-quality styles

interface Application {
  _id: string;
  userId: {
    _id: string;
    pic?: string;
    firstname: string;
    lastname: string;
    email: string;
    mobile: string;
  };
  experience: string;
  specialization: string;
  fees: string;
}

interface RootState {
  root: { loading: boolean };
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  // ✅ FIXED: Wrapped in useCallback to prevent infinite loading loop
  const getAllApp = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response: any = await fetchData("/api/doctor/getnotdoctors");

      // Safety check for data format
      const appArray = Array.isArray(response) ? response : (response.applications || []);
      setApplications(appArray);
    } catch (error) {
      console.error("Error fetching applications", error);
      toast.error("Failed to load applications");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    getAllApp();
  }, [getAllApp]);

  const acceptUser = async (userId: string) => {
    if (!window.confirm("Approve this doctor for clinical practice?")) return;

    try {
      await toast.promise(
        axios.put(
          "/api/doctor/acceptdoctor",
          { id: userId },
          { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
        ),
        {
          success: "Doctor profile activated!",
          error: "Unable to accept application",
          loading: "Processing approval...",
        }
      );
      getAllApp();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectUser = async (userId: string) => {
    if (!window.confirm("Reject and remove this application?")) return;

    try {
      await toast.promise(
        axios.put(
          "/api/doctor/rejectdoctor",
          { id: userId },
          { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
        ),
        {
          success: "Application rejected",
          error: "Unable to reject application",
          loading: "Processing rejection...",
        }
      );
      getAllApp();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h1>Doctor Applications</h1>
          <p>Review and verify new specialist registrations</p>
        </div>
        <div className="header-actions">
           <div className="stats-mini-badge">
             Pending Requests: <strong>{applications.length}</strong>
           </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : applications.length > 0 ? (
        <div className="table-container shadow-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Expertise</th>
                <th>Experience</th>
                <th>Desired Fee</th>
                <th className="text-center">Verification</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((ele) => (
                <tr key={ele._id} className="patient-row">
                  <td>
                    <div className="patient-profile">
                      <img
                        src={ele.userId.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                        alt="Applicant"
                        className="avatar"
                      />
                      <div>
                        <span className="patient-name">Dr. {ele.userId.firstname} {ele.userId.lastname}</span>
                        <span className="patient-id"><FaEnvelope /> {ele.userId.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="gender-tag pending-tag">{ele.specialization}</span>
                  </td>
                  <td>
                    <div className="info-item"><FaBriefcase style={{color: '#4e73df'}} /> {ele.experience} Years</div>
                  </td>
                  <td>
                    <div className="info-item"><FaMoneyBillWave style={{color: '#1cc88a'}} /> ${ele.fees}</div>
                  </td>
                  <td className="text-center">
                    <div className="action-button-group">
                      <button
                        className="action-btn accept"
                        title="Accept"
                        onClick={() => acceptUser(ele.userId._id)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="action-btn reject"
                        title="Reject"
                        onClick={() => rejectUser(ele.userId._id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message="No pending applications at the moment." />
      )}
    </section>
  );
};

export default AdminApplications;
