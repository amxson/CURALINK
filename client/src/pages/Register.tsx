import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Set the default base URL for axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const Register: React.FC = () => {
  const [file, setFile] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confpassword: "",
    role: "",
  });
  const navigate = useNavigate();

  // Handle input changes for form fields
  const inputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };


  // Handle file upload to Cloudinary
  const onUpload = async (element: File | null) => {
    if (!element) {
      toast.error("No file selected");
      return;
    }

    setLoading(true);
    if (
      element.type === "image/jpeg" ||
      element.type === "image/png" ||
      element.type === "image/jpg"
    ) {
      const data = new FormData();
      data.append("file", element);
      data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET!);
      data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME!);

      try {
        const response = await fetch(process.env.REACT_APP_CLOUDINARY_BASE_URL!, {
          method: "POST",
          body: data,
        });
        const result = await response.json();
        if (response.ok) {
          console.log("File uploaded successfully:", result.secure_url); // Debugging line
          setFile(result.secure_url); // Updated to use secure_url
        } else {
          throw new Error(result.error.message);
        }
      } catch (error: any) { // Cast error to 'any'
        toast.error(`Upload failed: ${error.message}`);
      }
      setLoading(false);
    } else {
      setLoading(false);
      toast.error("Please select an image in jpeg or png format");
    }
  };

const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (loading) return;

  // Set default file URL if no file is uploaded
  const finalFile = file || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  const { firstname, lastname, email, password, confpassword } = formDetails;
  if (!firstname || !lastname || !email || !password || !confpassword || !selectedRole) {
    return toast.error("Input field should not be empty");
  } else if (firstname.length < 3) {
    return toast.error("First name must be at least 3 characters long");
  } else if (lastname.length < 3) {
    return toast.error("Last name must be at least 3 characters long");
  } else if (password.length < 5) {
    return toast.error("Password must be at least 5 characters long");
  } else if (password !== confpassword) {
    return toast.error("Passwords do not match");
  }

  console.log("Submitting form with details:", formDetails); // Debugging line
  console.log("File URL:", finalFile); // Debugging line

  

  try {
    await axios.post("/api/user/register", {
      firstname,
      lastname,
      email,
      password,
      pic: finalFile,
      role: selectedRole,
    });
  
    toast.success("User registered successfully");
    navigate("/login");
  } catch (error: any) { // Cast error to 'any'
    // console.error("Registration error:", error); // Debugging line
    
    // Check for specific error statuses
    if (error.response) {
      if (error.response.status === 409) {
        toast.error("User already exists with this email");
      } else if (error.response.status === 403) {
        toast.error("You are not allowed to register with these credentials");
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    } else {
      toast.error(`Registration failed: ${error.message}`);
    }
  }
  
};

  

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Sign Up</h2>
          <form onSubmit={formSubmit} className="register-form">
            <input
              type="text"
              name="firstname"
              className="form-input"
              placeholder="Enter your first name"
              value={formDetails.firstname}
              onChange={inputChange}
            />
            <input
              type="text"
              name="lastname"
              className="form-input"
              placeholder="Enter your last name"
              value={formDetails.lastname}
              onChange={inputChange}
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formDetails.email}
              onChange={inputChange}
            />
            <input
              type="file"
              onChange={(e) => onUpload(e.target.files ? e.target.files[0] : null)}
              name="profile-pic"
              id="profile-pic"
              className="form-input"
            />
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formDetails.password}
              onChange={inputChange}
            />
            <input
              type="password"
              name="confpassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formDetails.confpassword}
              onChange={inputChange}
            />
            <select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-input"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
            </select>

            <button
              type="submit"
              className="btn form-btn"
              disabled={loading}
            >
              Sign Up
            </button>
          </form>
          <p>
            Already a user?{" "}
            <NavLink className="login-link" to={"/login"}>
              Log in
            </NavLink>
          </p>
        </div>
      </section>
    </>
  );
};

export default Register;