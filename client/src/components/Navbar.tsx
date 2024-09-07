import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { BsChevronDown } from "react-icons/bs"; // Dropdown icon

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface User {
  role: string;
  firstname: string;
  lastname: string;
  pic: string;
}

const Navbar: React.FC = () => {
  const [iconActive, setIconActive] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (token) {
      try {
        const { userId } = jwtDecode<{ userId: string }>(token);
        axios
          .get(`/api/user/getuser/${userId}`, {
            headers: { authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setUser(response.data);
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  const logoutFunc = () => {
    dispatch(setUserInfo({} as any)); // Clear user info
    localStorage.removeItem("token"); // Remove token from storage
    navigate("/login"); // Redirect to login page
  };

  return (
    <header>
      <nav className={iconActive ? "nav-active" : ""}>
        <h2 className="nav-logo">
          <NavLink to={"/"}>CuraLink</NavLink>
        </h2>
        <ul className="nav-links">
          <li>
            <NavLink to={"/"}>Home</NavLink>
          </li>
          {user && user.role === "Doctor" && (
            <>
              <li>
                <NavLink to={"/applyfordoctor"}>Apply for doctor</NavLink>
              </li>
              <li>
                <NavLink to={"/appointments"}>Appointments</NavLink>
              </li>
              <li>
                <NavLink to={"/notifications"}>Notifications</NavLink>
              </li>
              <li>
                <HashLink to={"/#contact"}>Contact Us</HashLink>
              </li>
            </>
          )}
          {user && user.role === "Patient" && (
            <>
              <li>
                <NavLink to={"/doctors"}>Doctors</NavLink>
              </li>
              <li>
                <NavLink to={"/notifications"}>Notifications</NavLink>
              </li>
              <li>
                <HashLink to={"/#contact"}>Contact Us</HashLink>
              </li>
            </>
          )}
          {!token ? (
            <>
              <li>
                <NavLink className="btn" to={"/login"}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink className="btn" to={"/register"}>
                  Register
                </NavLink>
              </li>
            </>
          ) : (
            <li className="profile-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="profile-header">
                {user && <img src={user.pic} alt="profile" className="profile-pic1" />}
                <span>{user?.firstname}</span>
                <BsChevronDown className="dropdown-icon" /> {/* Dropdown icon */}
              </div>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <NavLink to="/profile">Profile</NavLink>
                  </li>
                  <li>
                    <NavLink to="/ChangePassword">Change Password</NavLink>
                  </li>
                  <li>
                    <span onClick={logoutFunc}>Logout</span> {/* Added logout handler */}
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      <div className="menu-icons">
        {!iconActive && (
          <FiMenu
            className="menu-open"
            onClick={() => {
              setIconActive(true);
            }}
          />
        )}
        {iconActive && (
          <RxCross1
            className="menu-close"
            onClick={() => {
              setIconActive(false);
            }}
          />
        )}
      </div>
    </header>
  );
};

export default Navbar;
