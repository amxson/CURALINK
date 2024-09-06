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

      const doctors = response.data;
      setDoctorCount(doctors.length);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    }
  };

  useEffect(() => {
    fetchAppointmentCounts();
    fetchDoctorCount();
  }, []);

  return (
    <section className="container circles">
      <div className="circle">
        <CountUp
          start={0}
          end={totalCount}
          delay={0}
          enableScrollSpy={true}
          scrollSpyDelay={500}
        >
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
        </CountUp>
        <span className="circle-name">
          Total
          <br />
          Appointments
        </span>
      </div>
      <div className="circle">
        <CountUp
          start={0}
          end={completedCount}
          delay={0}
          enableScrollSpy={true}
          scrollSpyDelay={500}
        >
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
        </CountUp>
        <span className="circle-name">
          Satisfied
          <br />
          Patients
        </span>
      </div>
      <div className="circle">
        <CountUp
          start={0}
          end={doctorCount}
          delay={0}
          enableScrollSpy={true}
          scrollSpyDelay={500}
        >
          {({ countUpRef }) => (
            <div className="counter">
              <span ref={countUpRef} />+
            </div>
          )}
        </CountUp>
        <span className="circle-name">
          Verified
          <br />
          Doctors
        </span>
      </div>
    </section>
  );
};

export default HomeCircles;
