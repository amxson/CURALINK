import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../styles/doctors.css";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/reducers/rootSlice";
import Empty from "../components/Empty";
import { RootState } from "../redux/store"; // Update import path here

interface User {
  _id: string;
  pic?: string;
  firstname: string;
  lastname: string;
  mobile: string;
}

interface Doctor {
  _id: string;
  specialization: string;
  experience: number;
  fees: number;
  userId: User;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.root);

  const fetchAllDocs = async () => {
    dispatch(setLoading(true));
    try {
      const data = await fetchData<Doctor[]>(`api/doctor/getalldoctors`);
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllDocs();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      {loading && <Loading />}
      {!loading && (
        <section className="container doctors">
          <h2 className="page-heading">Our Doctors</h2>
          {doctors.length > 0 ? (
            <div className="doctors-card-container">
              {doctors.map((doctor) => (
                <DoctorCard
                  ele={doctor}
                  key={doctor._id}
                />
              ))}
            </div>
          ) : (
            <Empty message="No doctors found." />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Doctors;
