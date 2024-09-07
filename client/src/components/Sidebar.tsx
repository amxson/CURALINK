import React from "react";
import {
  FaHome,
  FaList,
  FaUser,
  FaUserMd,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";
import "../styles/sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebar = [
    {
      name: "Home",
      path: "/dashboard/home",
      icon: <FaHome />,
    },
    {
      name: "Patients", // Updated name
      path: "/dashboard/users", // Updated path
      icon: <FaUsers />,
    },
    {
      name: "Doctors",
      path: "/dashboard/doctors",
      icon: <FaUserMd />,
    },
    {
      name: "Appointments",
      path: "/dashboard/appointments",
      icon: <FaList />,
    },
    {
      name: "Applications",
      path: "/dashboard/applications",
      icon: <FaEnvelope />,
    },
    {
      name: "Profile",
      path: "/dashboard/aprofile",
      icon: <FaUser />,
    },
    {
      name: "Contact Messages",
      path: "/dashboard/contactMessages",
      icon: <FaEnvelope />,
    },
  ];

  const logoutFunc = () => {
    dispatch(setUserInfo({ id: '', email: '' })); // Provide default values
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <section className="sidebar-section flex-center">
        <div className="sidebar-container">
          <ul>
            {sidebar.map((item, index) => (
              <li key={index}>
                {item.icon}
                <NavLink to={item.path}>{item.name}</NavLink>
              </li>
            ))}
          </ul>
          <div className="logout-container">
            <MdLogout />
            <p onClick={logoutFunc}>Logout</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sidebar;
