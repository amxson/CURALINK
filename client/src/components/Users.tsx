import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import { RootState } from "../redux/store";

// Define the type for the user data
interface User {
  _id: string;
  pic: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  isDoctor: boolean;
}

// Define the state and props types if needed
const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { loading } = useSelector((state: RootState) => state.root);

  const getAllUsers = async () => {
    try {
      dispatch(setLoading(true));
      let url = "/api/user/getallusers";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      const temp: User[] = await fetchData(url);
      setUsers(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching users:", error);
      dispatch(setLoading(false));
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.delete("/api/user/deleteuser", {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            data: { userId },
          }),
          {
            loading: "Deleting user...", // Added missing 'loading' property
            success: "User deleted successfully",
            error: "Unable to delete user",
          }
        );
        getAllUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [filter, searchTerm]); // Add dependencies here

  const filteredUsers = users.filter((doc) => {
    if (filter === "all") {
      return true;
    } else if (filter === "firstname") {
      return doc.firstname.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h3 className="home-sub-heading">All Users</h3>
          {users.length > 0 ? (
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
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Is Doctor</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((ele, i) => (
                    <tr key={ele._id}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={ele.pic}
                          alt={ele.firstname}
                        />
                      </td>
                      <td>{ele.firstname}</td>
                      <td>{ele.lastname}</td>
                      <td>{ele.email}</td>
                      <td>{ele.mobile}</td>
                      <td>{ele.age}</td>
                      <td>{ele.gender}</td>
                      <td>{ele.isDoctor ? "Yes" : "No"}</td>
                      <td className="select">
                        <button
                          className="btn user-btn"
                          onClick={() => deleteUser(ele._id)}
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
            <Empty message="No appointments found." />
          )}
        </section>
      )}
    </>
  );
};

export default Users;
