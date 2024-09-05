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
import { jwtDecode } from 'jwt-decode';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

// Define the type for user data
interface User {
  pic: string;
  newpassword: string | null;
}

interface FormDetails {
  password: string;
  newpassword: string;
  confnewpassword: string;
}

interface DecodedToken {
  userId: string;
}

function ChangePassword() {
  const token = localStorage.getItem("token") || "";
  const { userId } = jwtDecode<DecodedToken>(token);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.root);
  const [file, setFile] = useState<string>("");
  const [formDetails, setFormDetails] = useState<FormDetails>({
    password: "",
    newpassword: "",
    confnewpassword: "",
  });

  const getUser = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`api/user/getuser/${userId}`) as User;
      setFormDetails({
        password: "",
        newpassword: temp.newpassword === null ? "" : temp.newpassword,
        confnewpassword: "",
      });
      setFile(temp.pic);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, [dispatch, userId]);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password, newpassword, confnewpassword } = formDetails;

    if (newpassword !== confnewpassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const response = await axios.put(
        "/api/user/changepassword",
        {
          userId: userId,
          currentPassword: password,
          newPassword: newpassword,
          confirmNewPassword: confnewpassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data === "Password changed successfully") {
        toast.success("Password updated successfully");
        setFormDetails({
          password: "",
          newpassword: "",
          confnewpassword: "",
        });
      } else {
        toast.error("Unable to update password");
      }
    } catch (error: unknown) {
      console.error("Error updating password:", error);

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data);
      } else {
        toast.error("Network error. Please try again.");
      }
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
            <img src={file} alt="profile" className="profile-pic" />
            <form onSubmit={formSubmit} className="register-form">
              <div className="form-same-row">
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your current password"
                  value={formDetails.password}
                  onChange={inputChange}
                />
              </div>
              <div className="form-same-row">
                <input
                  type="password"
                  name="newpassword"
                  className="form-input"
                  placeholder="Enter your new password"
                  value={formDetails.newpassword}
                  onChange={inputChange}
                />
                <input
                  type="password"
                  name="confnewpassword"
                  className="form-input"
                  placeholder="Confirm your new password"
                  value={formDetails.confnewpassword}
                  onChange={inputChange}
                />
              </div>
              <button type="submit" className="btn form-btn">
                Update
              </button>
            </form>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
}

export default ChangePassword;
