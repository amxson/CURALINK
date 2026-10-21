import jwtDecode from "jwt-decode";
import { Navigate } from "react-router-dom";
const identity = () => { try { const user = jwtDecode(localStorage.getItem("token") || ""); return user.exp * 1000 > Date.now() ? user : null; } catch { return null; } };
export const Protected = ({children}) => identity() ? children : <Navigate to="/login" replace />;
export const Public = ({children}) => identity() ? <Navigate to="/" replace /> : children;
export const Admin = ({children}) => identity()?.role === "Admin" ? children : <Navigate to="/" replace />;
export const Technician = ({children}) => ["Admin", "Technician"].includes(identity()?.role) ? children : <Navigate to="/" replace />;
