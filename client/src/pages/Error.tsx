import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/error.css";

// Define the functional component with no props
const Error: React.FC = () => {
  return (
    <div className="error container">
      <h2>Error! Page Not Found</h2>
      <NavLink to="/" className="btn">
        Go to Home
      </NavLink>
    </div>
  );
};

export default Error;
