import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import "../styles/sidebar.css";

import {
  FaHome, FaList, FaUser, FaUsers, FaUserPlus,
  FaEnvelope, FaUserMd, FaCommentAlt, FaStethoscope
} from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebarItems = [
    { name: "Home", path: "/dashboard/home", icon: <FaHome /> },
    { name: "Patients", path: "/dashboard/users", icon: <FaUsers /> },
    { name: "Doctors", path: "/dashboard/doctors", icon: <FaUserMd /> },
    { name: "Appointments", path: "/dashboard/appointments", icon: <FaList /> },
    { name: "Add Staff", path: "/dashboard/addstaff", icon: <FaUserPlus /> },
    { name: "Applications", path: "/dashboard/applications", icon: <FaEnvelope /> },
    { name: "Support", path: "/dashboard/contactMessages", icon: <FaCommentAlt /> },
    { name: "Profile", path: "/dashboard/aprofile", icon: <FaUser /> },
  ];

  const logoutFunc = () => {
    // Update to include _id and role
    dispatch(setUserInfo({ _id: "", email: "", role: "" }));
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar-section">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FaStethoscope />
        </div>
        <div className="brand-text">
          <h2>Cura<span>Link</span></h2>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-container">
        <ul className="sidebar-menu">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                aria-label={item.name}
                title={item.name}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="icon-wrapper">{item.icon}</span>
                <span className="link-text">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" aria-label="Sign Out" title="Sign Out" onClick={logoutFunc}>
            <div className="icon-wrapper">
              <MdLogout />
            </div>
            <span className="link-text">Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
