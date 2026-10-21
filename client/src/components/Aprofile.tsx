import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCamera, FaLock } from "react-icons/fa";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "./Loading";
import fetchData from "../helper/apiCall";
import jwtDecode from 'jwt-decode'; // Fixed: Destructured import for newer versions
import "../styles/Patients.css"; // Reuse shared container styles
import "../styles/Aprofile.css";

// --- Types ---
interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  age: string;
  mobile: string;
  gender: string;
  address: string;
  pic: string;
}

interface FormDetails extends Omit<User, '_id' | 'pic'> {
  password?: string;
  confpassword?: string;
}

interface TokenPayload {
  userId: string;
}

const Aprofile: React.FC = () => {
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

  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.root);
  const token = localStorage.getItem("token");

  // Get UserID from token safely
  const getUserIdFromToken = (): string => {
    if (!token) return "";
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.userId;
    } catch (e) {
      return "";
    }
  };

  const userId = getUserIdFromToken();

  const getUser = useCallback(async () => {
    if (!userId) return;
    try {
      dispatch(setLoading(true));
      // ✅ FIX: Added leading slash "/" to ensure absolute path
      const temp = await fetchData<User>(`/api/user/getuser/${userId}`);

      setFormDetails({
        firstname: temp.firstname,
        lastname: temp.lastname,
        email: temp.email,
        age: temp.age || "",
        mobile: temp.mobile || "",
        gender: temp.gender,
        address: temp.address,
        password: "",
        confpassword: "",
      });
      setFile(temp.pic);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Account data not found.");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const inputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password, confpassword, ...details } = formDetails;

    if (password && password.length < 5) return toast.error("Password too short");
    if (password !== confpassword) return toast.error("Passwords do not match");

    try {
      await toast.promise(
        axios.put(
          "/api/user/updateprofile",
          { ...details, password, pic: file },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        {
          loading: "Updating profile...",
          success: "Profile synchronized!",
          error: "Update failed",
        }
      );
      setFormDetails(prev => ({ ...prev, password: "", confpassword: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  // Convert image to base64 for preview and upload
  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h1>Account Settings</h1>
          <p>Personalize your healthcare dashboard profile</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Card: Avatar & Overview */}
        <div className="profile-card profile-sidebar shadow-card">
          <div className="avatar-wrapper">
            <img src={file || "https://via.placeholder.com/150"} alt="Profile" className="large-avatar" />
            <label htmlFor="pic-upload" className="camera-btn">
              <FaCamera />
              <input type="file" id="pic-upload" hidden onChange={onUpload} />
            </label>
          </div>
          <h2 className="user-full-name">{formDetails.firstname} {formDetails.lastname}</h2>
          <span className="role-badge">Administrator</span>

          <div className="sidebar-info">
             <div className="info-item"><FaEnvelope /> {formDetails.email}</div>
             <div className="info-item"><FaPhoneAlt /> {formDetails.mobile || "No phone"}</div>
          </div>
        </div>

        {/* Right Card: Form Details */}
        <div className="profile-card profile-main shadow-card">
          <form onSubmit={formSubmit} className="modern-form">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-row">
              <div className="input-group">
                <label><FaUser /> First Name</label>
                <input type="text" name="firstname" value={formDetails.firstname} onChange={inputChange} required />
              </div>
              <div className="input-group">
                <label><FaUser /> Last Name</label>
                <input type="text" name="lastname" value={formDetails.lastname} onChange={inputChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label><FaEnvelope /> Email Address</label>
                <input type="email" name="email" value={formDetails.email} onChange={inputChange} required />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" value={formDetails.gender} onChange={inputChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="neither">Other</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label><FaMapMarkerAlt /> Physical Address</label>
              <textarea name="address" rows={2} value={formDetails.address} onChange={inputChange}></textarea>
            </div>

            <h3 className="section-title" style={{ marginTop: '2rem' }}><FaLock /> Security</h3>
            <div className="form-row">
              <div className="input-group">
                <label>New Password</label>
                <input type="password" name="password" value={formDetails.password} onChange={inputChange} placeholder="Leave blank to keep current" />
              </div>
              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" name="confpassword" value={formDetails.confpassword} onChange={inputChange} />
              </div>
            </div>

            <button type="submit" className="update-btn">Save Profile Changes</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Aprofile;
