import React, { useEffect, useState } from "react";
import "../styles/profile.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";
import fetchData from "../helper/apiCall";
import { jwtDecode } from "jwt-decode";
import { RootState } from "../redux/store";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface User {
  firstname: string;
  lastname: string;
  email: string;
  age: string;
  mobile: string;
  gender: string;
  address: string;
  pic: string;
}

interface FormDetails {
  firstname: string;
  lastname: string;
  email: string;
  age: string;
  mobile: string;
  gender: string;
  address: string;
  password: string;
  confpassword: string;
}

const Profile: React.FC = () => {
  const { userId } = jwtDecode<{ userId: string }>(localStorage.getItem("token")!);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);
  const [file, setFile] = useState<string>("");
  const [formDetails, setFormDetails] = useState<FormDetails>({
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    mobile: "",
    gender: "neither",
    address: "",
    password: "",
    confpassword: "",
  });

  const getUser = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData<User>(`api/user/getuser/${userId}`);
      setFormDetails({
        ...temp,
        password: "",
        confpassword: "",
        mobile: temp.mobile ?? "",
        age: temp.age ?? "",
      });
      setFile(temp.pic);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data.");
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getUser();
  }, [dispatch, userId]);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { email, mobile, age, password, confpassword } = formDetails;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10,14}$/; // Assumes a phone number of 10 to 14 digits
    const ageRegex = /^(?:1[89]|[2-9]\d)$/; // Assumes age range from 18 to 99

    if (!email || !emailRegex.test(email)) {
      return toast.error("Please enter a valid email address.");
    } else if (!mobile || !mobileRegex.test(mobile)) {
      return toast.error("Please enter a valid phone number (10-14 digits).");
    } else if (!age || !ageRegex.test(age)) {
      return toast.error("Age must be a valid number between 18 and 99.");
    } else if (password.length < 5) {
      return toast.error("Password must be at least 5 characters long.");
    } else if (password !== confpassword) {
      return toast.error("Passwords do not match.");
    }
    return true;
  };

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const {
        firstname,
        lastname,
        email,
        age,
        mobile,
        address,
        gender,
        password,
      } = formDetails;

      await toast.promise(
        axios.put(
          "/api/user/updateprofile",
          {
            firstname,
            lastname,
            age,
            mobile,
            address,
            gender,
            email,
            password,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully",
          error: "Unable to update profile",
        }
      );

      setFormDetails({ ...formDetails, password: "", confpassword: "" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Unable to update profile");
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="register-section flex-center">
          <div className="profile-container flex-center">
            <h2 className="form-heading">Profile</h2>
            <img
              src={file}
              alt="profile"
              className="profile-pic"
            />
            <form
              onSubmit={formSubmit}
              className="register-form"
            >
              <div className="form-same-row">
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
              </div>
              <div className="form-same-row">
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formDetails.email}
                  onChange={inputChange}
                />
                <select
                  name="gender"
                  value={formDetails.gender}
                  className="form-input"
                  id="gender"
                  onChange={inputChange}
                >
                  <option value="neither">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-same-row">
                <input
                  type="text"
                  name="age"
                  className="form-input"
                  placeholder="Enter your age"
                  value={formDetails.age}
                  onChange={inputChange}
                />
                <input
                  type="text"
                  name="mobile"
                  className="form-input"
                  placeholder="Enter your mobile number"
                  value={formDetails.mobile}
                  onChange={inputChange}
                />
              </div>
              <textarea
                name="address"
                className="form-input"
                placeholder="Enter your address"
                value={formDetails.address}
                onChange={inputChange}
                rows={2}
              />
              <div className="form-same-row">
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
              </div>
              <button
                type="submit"
                className="btn form-btn"
              >
                Update
              </button>
            </form>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
};

export default Profile;
