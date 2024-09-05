import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { jwtDecode } from 'jwt-decode';

// Define types for user data decoded from JWT
interface User {
  isAdmin?: boolean;
  // Add other properties as per your JWT payload
}

// Define type for the token
interface TokenPayload {
  isAdmin?: boolean;
  // Add other properties as per your JWT payload
}

// Define UserInfo type used by the reducer
interface UserInfo {
  id: string;
  email: string;
  isAdmin?: boolean;
  // Add other properties if needed
}

const Navbar: React.FC = () => {
  const [iconActive, setIconActive] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User>(
    token ? jwtDecode<TokenPayload>(token) : {}
  );

  const logoutFunc = () => {
    const defaultUserInfo: UserInfo = {
      id: "",
      email: "",
      // Provide default values for other required fields
    };
    dispatch(setUserInfo(defaultUserInfo));
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header>
      <nav className={iconActive ? "nav-active" : ""}>
        <h2 className="nav-logo">
          <NavLink to={"/"}>Doctor's Appointment</NavLink>
        </h2>
        <ul className="nav-links">
          <li>
            <NavLink to={"/"}>Home</NavLink>
          </li>
          <li>
            <NavLink to={"/doctors"}>Doctors</NavLink>
          </li>
          {token && user.isAdmin && (
            <li>
              <NavLink to={"/dashboard/users"}>Dashboard</NavLink>
            </li>
          )}
          {token && !user.isAdmin && (
            <>
              <li>
                <NavLink to={"/notifications"}>Notifications</NavLink>
              </li>
              <li>
                <HashLink to={"/#contact"}>Contact Us</HashLink>
              </li>
              <li>
                <NavLink to={"/profile"}>Profile</NavLink>
              </li>
              <li>
                <NavLink to={"/ChangePassword"}>Change Password</NavLink>
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
            <li>
              <span className="btn" onClick={logoutFunc}>
                Logout
              </span>
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
