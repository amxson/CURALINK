import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { FaUserMd, FaCalendarCheck, FaUserInjured, FaArrowUp } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../styles/Home.css";

// Your official master list
const SPECIALIZATIONS = [
  "General Practitioner", "Neurologist", "Cardiologist", "ENT Specialist",
  "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Gynecologist",
  "Psychiatrist", "Ophthalmologist", "Urologist", "Oncologist",
  "Endocrinologist", "Gastroenterologist", "Pulmonologist", "Rheumatologist",
  "Nephrologist", "Hematologist", "Anesthesiologist", "Emergency Medicine",
  "Pathologist", "Radiologist", "Plastic Surgeon", "Infectious Disease Specialist",
  "Physiotherapist",
];

const Home: React.FC = () => {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [appointmentCount, setAppointmentCount] = useState<number>(0);
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [realDeptData, setRealDeptData] = useState<{ name: string; count: number }[]>([]);

  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.root);
  const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"];

  const fetchDataCounts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };

      const [userRes, appRes, docRes] = await Promise.all([
        axios.get("/api/user/getallusers", { headers }),
        axios.get("/api/appointment/getallappointments", { headers }),
        // ADDED LIMIT=1000 to fetch all 300+ doctors for the graph
        axios.get("/api/doctor/getalldoctors?limit=1000", { headers })
      ]);

      const userData = Array.isArray(userRes.data) ? userRes.data : (userRes.data.users || []);
      const pCount = userData.filter((u: any) => u.role === "Patient").length;
      const aCount = Array.isArray(appRes.data) ? appRes.data.length : (appRes.data.appointments?.length || 0);
      const dCount = docRes.data.total || (Array.isArray(docRes.data) ? docRes.data.length : 0);

      setPatientCount(pCount);
      setAppointmentCount(aCount);
      setDoctorCount(dCount);

      // --- PROCESS ALL 300+ DOCTORS ---
      const doctors = Array.isArray(docRes.data) ? docRes.data : (docRes.data.doctors || []);

      // Initialize map with all specializations set to 0
      const counts: { [key: string]: number } = {};
      SPECIALIZATIONS.forEach(spec => counts[spec] = 0);

      doctors.forEach((doc: any) => {
        const spec = doc.specialization;
        if (counts.hasOwnProperty(spec)) {
          counts[spec] += 1;
        }
      });

      const formattedDeptData = Object.keys(counts).map(key => ({
        name: key,
        count: counts[key]
      })).sort((a, b) => b.count - a.count); // Sort busy ones to top

      setRealDeptData(formattedDeptData);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Fetch Error:", error);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => { fetchDataCounts(); }, [fetchDataCounts]);

  const distributionData = [
    { name: "Patients", value: patientCount },
    { name: "Doctors", value: doctorCount },
    { name: "Appointments", value: appointmentCount },
  ];

  if (loading) return <Loading />;

  return (
    <section className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>CuraLink Analytics</h1>
          <p>Full facility data visualization.</p>
        </div>
        <button className="refresh-btn" onClick={fetchDataCounts}>
          <HiOutlineRefresh /> Sync Data
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Patients" count={patientCount} icon={<FaUserInjured />} color="#4e73df" trend="+8%" />
        <StatCard title="Appointments" count={appointmentCount} icon={<FaCalendarCheck />} color="#1cc88a" trend="+15%" />
        <StatCard title="Total Doctors" count={doctorCount} icon={<FaUserMd />} color="#36b9cc" trend="+3%" />
      </div>

      <div className="main-charts-row">
        <div className="chart-card">
          <div className="card-header-flex">
             <h3>Specialization Breakdown</h3>
             <span className="live-indicator">Live</span>
          </div>
          <div className="scrollable-y-container">
            <ResponsiveContainer width="100%" height={SPECIALIZATIONS.length * 40}>
              <BarChart data={realDeptData} layout="vertical" margin={{ left: 20, right: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11, fontWeight: 500}} axisLine={false} />
                <Tooltip formatter={(value: number) => [`${value} Doctors`, "Total"]} />
                <Bar
                  dataKey="count"
                  fill="#4e73df"
                  radius={[0, 10, 10, 0]}
                  barSize={18}
                  // SHOW COUNT AT END OF BAR
                  label={{ position: 'right', fill: '#4e73df', fontSize: 12, fontWeight: 'bold' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Overall Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={distributionData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()}`, "Count"]} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ title, count, icon, color, trend }: any) => (
  <div className="modern-card">
    <div className="card-body">
      <div className="icon-box" style={{ backgroundColor: `${color}15`, color: color }}>{icon}</div>
      <div className="card-info">
        <span>{title}</span>
        <h2>{count.toLocaleString()}</h2>
        <p className="trend"><FaArrowUp /> {trend}</p>
      </div>
    </div>
  </div>
);

export default Home;
