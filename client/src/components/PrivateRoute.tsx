import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface User {
  role: string;
}

const PrivateRoute: React.FC<{ requiredRole: string }> = ({ requiredRole }) => {
  const token = localStorage.getItem("token");
  let user: User | null = null;

  if (token) {
    try {
      user = jwtDecode<User>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  if (!user || user.role !== requiredRole) {
    // Redirect user if not an admin
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
