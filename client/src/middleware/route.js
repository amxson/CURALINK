import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import React from 'react';

export const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace={true} />;
  }
  return children;
};

export const Public = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return children;
  }
  return <Navigate to="/" replace={true} />;
};

export const Admin = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace={true} />;
  }

  // Optional: Check if the user is an admin
  // const user = jwtDecode(token);
  // if (user.isAdmin) {
  //   return children;
  // }

  return children;
};
