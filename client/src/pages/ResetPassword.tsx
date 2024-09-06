import React, { useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Set the default base URL for axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

// Define the type for route parameters
type Params = {
  id?: string;
  token?: string;
};

const ResetPassword: React.FC = () => {
  const { id, token } = useParams<Params>(); // Adjusted type for useParams
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      return toast.error("Password is required");
    }

    try {
      const response = await axios.post(`/api/user/resetpassword/${id}/${token}`, { password });

      if (response.status === 200) {
        toast.success("Password reset successfully");
        navigate('/login');
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error: any) { // Cast error to 'any'
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Reset Password</h2>
          <form onSubmit={handleFormSubmit} className="register-form">
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your new password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button type="submit" className="btn form-btn">
              Reset Password
            </button>
          </form>
          <NavLink className="login-link" to="/login">
            Back to Login
          </NavLink>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;
