import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const Register: React.FC = () => {
  const [file, setFile] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1); // Track current page
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confpassword: "",
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

  const nextPage = () => {
    // Validation for the first page before proceeding
    const { firstname, lastname, email, password, confpassword } = formDetails;
    if (!firstname || !lastname || !email || !password || !confpassword) {
      return toast.error("Input field should not be empty");
    } else if (password !== confpassword) {
      return toast.error("Passwords do not match");
    }
    setPage(2); // Move to the second page
  };

  const previousPage = () => setPage(1);

  // Handle file upload to Cloudinary
  const onUpload = async (element: File | null) => {
    if (!element) {
      toast.error("No file selected");
      return;
    }

    setLoading(true);
    if (["image/jpeg", "image/png", "image/jpg"].includes(element.type)) {
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
          setFile(result.secure_url);
        } else {
          throw new Error(result.error.message);
        }
      } catch (error: any) {
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

    const finalFile = file || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    const { firstname, lastname, email, password } = formDetails;

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
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("User already exists with this email");
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
            {page === 1 ? (
              <>
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
                <button type="button" className="btn form-btn" onClick={nextPage}>
                  Next
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  onChange={(e) => onUpload(e.target.files ? e.target.files[0] : null)}
                  name="profile-pic"
                  id="profile-pic"
                  className="form-input"
                />
                <select
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                </select>

                <div className="button-container">
                  <button type="button" className="btn form-btn" onClick={previousPage}>
                    Previous
                  </button>
                  <button type="submit" className="btn form-btn" disabled={loading}>
                    Register
                  </button>
                </div>
              </>
            )}
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
