import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import jwtDecode from 'jwt-decode';
import fetchData from "../helper/apiCall";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

// Match these interfaces exactly to your Redux rootSlice
interface UserRole {
  userId: string;
  role: string;
}

interface UserInfo {
  _id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
}

function Login() {
  const dispatch = useDispatch();
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();

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
          success: "Login successful",
          error: "Unable to login user",
        }
      );

      localStorage.setItem("token", data.token);

      // Decode token to get the userId and role stored in JWT
      const decodedToken = jwtDecode<any>(data.token);

      dispatch(setUserInfo({
        _id: decodedToken.userId, // Use userId from your payload
        email: email,
        role: decodedToken.role
      }));

      getUser(decodedToken.userId, decodedToken.role);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 400) {
        toast.error(axiosError.response?.data as string);
      } else {
        console.error("Login error:", error);
        toast.error("Login failed");
      }
    }
  };

  const getUser = async (id: string, role: string) => {
    try {
      // Fetch full user object from backend
      const temp = await fetchData(`/api/user/getuser/${id}`) as any;

      // Build a complete UserInfo object to satisfy TypeScript and Redux
      const completeUserInfo: UserInfo = {
        _id: temp._id || temp.id || id,
        email: temp.email || formDetails.email,
        role: temp.role || role,
        firstname: temp.firstname,
        lastname: temp.lastname
      };

      dispatch(setUserInfo(completeUserInfo));

      // Navigation Logic
      if (role === "Admin") {
        navigate("/dashboard/home");
      } else if (role === "Technician") {
        navigate("/lab-dashboard");
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
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
              <option value="Technician">Lab Technician</option>
            </select>
            <button type="submit" className="btn form-btn">
              Log In
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
