import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

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
  root: {
    loading: boolean;
  };
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllApp = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData<Application[]>("/api/doctor/getnotdoctors");
      setApplications(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching applications", error);
    }
  };

  const acceptUser = async (userId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to accept?");
      if (confirm) {
        await toast.promise(
          axios.put(
            "/api/doctor/acceptdoctor",
            { id: userId },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          {
            success: "Application accepted",
            error: "Unable to accept application",
            loading: "Accepting application...",
          }
        );
        getAllApp();
      }
    } catch (error) {
      console.error("Error accepting user", error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.put(
            "/api/doctor/rejectdoctor",
            { id: userId },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          {
            success: "Application rejected",
            error: "Unable to reject application",
            loading: "Rejecting application...",
          }
        );
        getAllApp();
      }
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  useEffect(() => {
    getAllApp();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Applications</h3>
          {applications.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Pic</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th>Fees</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((ele, i) => (
                    <tr key={ele._id}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={
                            ele.userId.pic ||
                            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          }
                          alt={ele.userId.firstname}
                        />
                      </td>
                      <td>{ele.userId.firstname}</td>
                      <td>{ele.userId.lastname}</td>
                      <td>{ele.userId.email}</td>
                      <td>{ele.userId.mobile}</td>
                      <td>{ele.experience}</td>
                      <td>{ele.specialization}</td>
                      <td>{ele.fees}</td>
                      <td className="select">
                        <button
                          className="btn user-btn accept-btn"
                          onClick={() => acceptUser(ele.userId._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn user-btn"
                          onClick={() => deleteUser(ele.userId._id)}
                        >
                          Reject
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

export default AdminApplications;
