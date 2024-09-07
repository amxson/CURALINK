import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

// Define TypeScript interfaces for doctor and state
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
  root: {
    loading: boolean;
  };
}

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      let url = "api/doctor/getalldoctors";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      const temp: Doctor[] = await fetchData(url);
      setDoctors(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error(error);
      dispatch(setLoading(false));
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.put(
            "/api/doctor/deletedoctor",
            { userId },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          {
            success: "Doctor deleted successfully",
            error: "Unable to delete Doctor",
            loading: "Deleting Doctor...",
          }
        );
        getAllDoctors();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (filter === "all") {
      return true;
    } else if (filter === "specialization") {
      return doc.specialization
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    } else if (filter === "firstname") {
      return (
        doc.userId &&
        doc.userId.firstname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return true;
    }
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <div className="ayx">
            <div className="filter">
              <label htmlFor="filter">Filter by:</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="firstname">Name</option>
                <option value="specialization">Specialization</option>
              </select>
            </div>

            <div className="search">
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                className="form-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
              />
            </div>
          </div>
          <h3 className="home-sub-heading">All Doctors</h3>
          {filteredDoctors.length > 0 ? (
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
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((ele, i) => (
                    <tr key={ele._id}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={ele.userId.pic}
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
                          className="btn user-btn"
                          onClick={() => deleteUser(ele.userId._id)}
                        >
                          Remove
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
      )}
    </>
  );
};

export default AdminDoctors;
