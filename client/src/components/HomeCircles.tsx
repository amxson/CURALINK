import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import axios from "axios";
import "../styles/homecircles.css";

const HomeCircles: React.FC = () => {
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [doctorCount, setDoctorCount] = useState<number>(0);

  // Fetch data from the API
  const fetchAppointmentCounts = async () => {
    try {
      // Fetch total appointments
      const totalResponse = await axios.get("/api/appointment/count/total");
      setTotalCount(totalResponse.data.totalAppointments);

      // Fetch completed appointments
      const completedResponse = await axios.get("/api/appointment/count/completed");
      setCompletedCount(completedResponse.data.completedAppointments);
    } catch (error) {
      console.error("Failed to fetch appointment counts", error);
    }
  };

const fetchDoctorCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/doctor/getalldoctors", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      // FIX: Your backend returns an object: { total: 10, doctors: [...], ... }
      // We should use the 'total' field provided by the backend.
      const totalDoctors = response.data.total || 0;

      setDoctorCount(totalDoctors);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    }
  };

  useEffect(() => {
    fetchAppointmentCounts();
    fetchDoctorCount();
  }, []);

  return (
// ... inside your HomeCircles.tsx return
<section className="circles-section">
  <h2 className="circles-title">Impact by the Numbers</h2>
  <p className="circles-subtitle">Real-time statistics from our growing healthcare network</p>

  <div className="circles">
    {/* Card 1 */}
    <div className="circle">
       <CountUp end={totalCount} enableScrollSpy={true}>
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
       </CountUp>
       <span className="circle-name">Appointments Done</span>
    </div>

    {/* Card 2 */}
    <div className="circle">
       <CountUp end={completedCount} enableScrollSpy={true}>
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
       </CountUp>
       <span className="circle-name">Happy Patients</span>
    </div>

    {/* Card 3 */}
    <div className="circle">
       <CountUp end={doctorCount} enableScrollSpy={true}>
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
       </CountUp>
       <span className="circle-name">Specialist Doctors</span>
    </div>
  </div>
</section>
  );
};

export default HomeCircles;
