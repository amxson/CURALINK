import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { jwtDecode } from 'jwt-decode'; // Update this line
import fetchData from "../helper/apiCall";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface UserRole {
  userId: string;
  // Add other properties if needed
}

interface UserInfo {
  id: string;
  email: string;
  // Add other properties if needed
}

function Login() {
  const dispatch = useDispatch();
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
    role: "", 
  });
  const navigate = useNavigate();
  // const [userRole, setUserRole] = useState(""); // Remove or use as needed

  const inputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const formSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, role } = formDetails;

    if (!email || !password) {
      return toast.error("Email and password are required");
    } else if (!role) {
      return toast.error("Please select a role");
    } else if (role !== "Admin" && role !== "Doctor" && role !== "Patient") {
      return toast.error("Please select a valid role");
    } else if (password.length < 5) {
      return toast.error("Password must be at least 5 characters long");
    }

    try {
      const { data } = await toast.promise(
        axios.post("/api/user/login", {
          email,
          password,
          role,
        }),
        {
          loading: "Logging in...",
          success: "Login successfully",
          error: "Unable to login user",
        }
      );

      localStorage.setItem("token", data.token);
      const decodedToken = jwtDecode<UserRole>(data.token); // Update this line
      dispatch(setUserInfo({ id: decodedToken.userId, email })); // Adjust based on actual UserInfo structure
      // setUserRole(role); // Uncomment if used
      getUser(decodedToken.userId, role);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    }
  };

  const getUser = async (id: string, role: string) => {
    try {
      const temp = await fetchData(`/api/user/getuser/${id}`) as UserInfo;
      dispatch(setUserInfo(temp));
      if (role === "Admin") {
        navigate("/dashboard/home");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Get user error:", error);
      toast.error("Failed to get user information");
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Sign In</h2>
          <form onSubmit={formSubmit} className="register-form">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formDetails.email}
              onChange={inputChange}
            />
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formDetails.password}
              onChange={inputChange}
            />
            <select
              name="role"
              className="form-input"
              value={formDetails.role}
              onChange={inputChange}
            >
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
            </select>
            <button type="submit" className="btn form-btn">
              Sign In
            </button>
          </form>
          <NavLink className="login-link" to="/forgotpassword">
            Forgot Password
          </NavLink>
          <p>
            Not a user?{" "}
            <NavLink className="login-link" to="/register">
              Register
            </NavLink>
          </p>
        </div>
      </section>
    </>
  );
}

export default Login;
