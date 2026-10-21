import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import DoctorCard from "../components/DoctorCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../styles/doctors.css";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import Empty from "../components/Empty";

interface User {
  _id: string;
  pic?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  mobile?: string | null;
}

interface Doctor {
  _id: string;
  specialization: string;
  experience: number;
  fees: number;
  userId?: User | null;
}

const specializations = [
  "All", "General Practitioner", "Neurologist", "Cardiologist", "ENT Specialist",
  "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Gynecologist",
  "Psychiatrist", "Ophthalmologist", "Urologist", "Oncologist",
  "Endocrinologist", "Gastroenterologist", "Pulmonologist", "Rheumatologist",
  "Nephrologist", "Hematologist", "Anesthesiologist", "Emergency Medicine",
  "Pathologist", "Radiologist", "Plastic Surgeon", "Infectious Disease Specialist",
  "Physiotherapist"
];

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");

  const observer = useRef<IntersectionObserver | null>(null);

  const lastDoctorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchData<{ doctors: Doctor[]; totalPages: number }>(
        `api/doctor/getalldoctors?page=${page}&limit=20`
      );
      if (res?.doctors?.length) {
        setDoctors((prev) => [...prev, ...res.doctors]);
      }
      if (page >= (res?.totalPages || 0)) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const fullName = `${doc.userId?.firstname} ${doc.userId?.lastname}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesSpec = selectedSpec === "All" || doc.specialization === selectedSpec;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchTerm, selectedSpec]);

  return (
    <div className="wrapper">
      <Navbar />
      <div className="content doctora-page">
        <header className="doctors-hero-section">
          <h1 className="page-heading">Find Your Specialist</h1>
          <p className="hero-subtitle">Book with 500+ top-rated Ethiopian medical professionals</p>

          <div className="filter-container">
            <input
              type="text"
              placeholder="Search doctor name..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="spec-select"
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
            >
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </header>

        <section className="doctor-card-container">
          {filteredDoctors.length === 0 && !loading ? (
            <Empty message="No doctors found matching your criteria." />
          ) : (
            filteredDoctors.map((doctor, idx) => (
              <div
                ref={filteredDoctors.length === idx + 1 ? lastDoctorRef : null}
                key={doctor._id}
                className="card-wrapper"
              >
                <DoctorCard ele={doctor} />
              </div>
            ))
          )}
        </section>

        {loading && <div className="loading-center"><Loading /></div>}
      </div>
      <Footer />
    </div>
  );
};

export default Doctors;
