import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";

import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { BsChevronDown } from "react-icons/bs";

import jwtDecode from "jwt-decode";
import axios from "axios";
import fetchData from "../helper/apiCall";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface User {
  _id: string;
  role: string;
  firstname: string;
  lastname: string;
  pic: string;
}

interface DoctorResponse {
  doctors: {
    _id: string;
    userId: any; // Can be string or object
  }[];
}

const Navbar: React.FC = () => {
  const [iconActive, setIconActive] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDoctorVerified, setIsDoctorVerified] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

useEffect(() => {
    if (token) {
      try {
        // 1. Decode token once at the start
        const decoded = jwtDecode<{ userId: string }>(token);
        const currentUserId = decoded.userId;

        axios
          .get(`/api/user/getuser/${currentUserId}`, {
            headers: { authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setUser(res.data);

            // 2. Only fetch doctors if role is "Doctor"
            if (res.data.role === "Doctor") {
              return fetchData<DoctorResponse>("api/doctor/getalldoctors");
            }
            return null;
          })
          .then((data) => {
            // 3. Logic to verify doctor status
            if (data && data.doctors) {
              const verified = data.doctors.some((doc: any) => {
                const docUserId = doc.userId?._id || doc.userId;
                // Use currentUserId from the closure, not user._id (which might be null still)
                return String(docUserId).trim() === String(currentUserId).trim();
              });
              setIsDoctorVerified(verified);
            } else {
              setIsDoctorVerified(false);
            }
          })
          .catch((err) => {
            console.error("Navbar data error:", err);
          });
      } catch (err) {
        console.error("Token decode error:", err);
      }
    } else {
      setUser(null);
      setIsDoctorVerified(false);
    }
  }, [token]);
  const logoutFunc = () => {
    dispatch(setUserInfo({} as any));
    localStorage.removeItem("token");
    setUser(null);
    setIsDoctorVerified(false);
    navigate("/login");
  };

  return (
    <header>
      <nav className={iconActive ? "nav-active" : ""}>
        <h2 className="nav-logo">
          <NavLink to={"/"}>CuraLink</NavLink>
        </h2>

        <ul className="nav-links" onClick={() => setIconActive(false)}>
          <li><NavLink to={"/"}>Home</NavLink></li>

          {/* DOCTOR LOGIC */}
          {user?.role === "Doctor" && (
            <>
              {isDoctorVerified ? (
                <li><NavLink to={"/appointments"}>Appointments</NavLink></li>
              ) : (
                <li><NavLink to={"/applyfordoctor"}>Apply for doctor</NavLink></li>
              )}
            </>
          )}

          {/* PATIENT LOGIC */}
          {user?.role === "Patient" && (
            <li><NavLink to={"/doctors"}>Doctors</NavLink></li>
          )}

          {/* ADMIN LOGIC (Optional but good to have) */}
          {user?.role === "Admin" && (
            <li><NavLink to={"/dashboard/home"}>Admin Panel</NavLink></li>
          )}

          {["Technician", "Admin"].includes(user?.role || "") && <li><NavLink to="/lab-dashboard">Laboratory</NavLink></li>}

          {/* SHARED LINKS */}
          {token && (
            <>
              <li><NavLink to={"/notifications"}>Notifications</NavLink></li>
              <li><HashLink to={"/#contact"}>Contact Us</HashLink></li>
            </>
          )}

          {/* GUEST LINKS */}
          {!token && (
            <>
              <li><NavLink className="btn" to={"/login"}>Login</NavLink></li>
              <li><NavLink className="btn" to={"/register"}>Register</NavLink></li>
            </>
          )}
        </ul>

        {token && (
          <div className="profile-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="profile-header">
              <img src={user?.pic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="profile" className="profile-pic1" />
              <span>{user?.firstname}</span>
              <BsChevronDown className="dropdown-icon" />
            </div>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li><NavLink to="/profile">Profile</NavLink></li>
                <li><NavLink to="/ChangePassword">Password</NavLink></li>
                <li onClick={logoutFunc} style={{ cursor: "pointer", color: "red" }}>Logout</li>
              </ul>
            )}
          </div>
        )}
      </nav>

      <button type="button" aria-label="Toggle navigation" aria-expanded={iconActive} className="menu-icons" onClick={() => setIconActive(!iconActive)}>
        {iconActive ? <RxCross1 /> : <FiMenu />}
      </button>
    </header>
  );
};

export default Navbar;
