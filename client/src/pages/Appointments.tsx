import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Empty from "../components/Empty";
import fetchData from "../helper/apiCall";
import { setLoading, setOpdAppointments } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import { toast } from "react-hot-toast";
import PrescriptionModal from "../components/PrescriptionModal";
import jwtDecode from "jwt-decode";
import axios from "axios";
import {
  FiSearch, FiCalendar, FiCheck, FiX,
  FiActivity, FiFileText, FiGitCommit, FiGitBranch
} from "react-icons/fi";
import "../styles/appoint.css";
import { RootState } from "../redux/store";
import BookAppointment from "../components/BookAppointment";
import RequestLab from "../components/RequestLab";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

interface Appointment {
  _id: string;
  opdType?: string;
  roomNumber?: string;
  doctorId: { _id?: string; firstname: string; lastname: string; pic: string };
  userId: { _id?: string; firstname: string; lastname: string; pic: string };
  date: string;
  status: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"regular" | "opd">("regular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [prescModalOpen, setPrescModalOpen] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Appointment["doctorId"] | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const PerPage = 10;
  const dispatch = useDispatch();
  const { loading, opdAppointments } = useSelector((state: RootState) => state.root);
  const token = localStorage.getItem("token") || "";

  const userId = useMemo(() => {
    if (!token) return "";
    try {
      const decoded = jwtDecode<{ userId: string }>(token);
      return decoded.userId;
    } catch { return ""; }
  }, [token]);

const refreshData = useCallback(async () => {
  if (!userId) return;
  try {
    dispatch(setLoading(true));

    // 1. Tell fetchData what type to expect (if fetchData is a generic function)
    const reg = await fetchData<Appointment[]>(`/api/appointment/getallappointments?search=${userId}`);

    // OR 2. Use a type assertion if fetchData isn't generic
    // const reg = (await fetchData(`/api/appointment/getallappointments?search=${userId}`)) as Appointment[];

    const opd = await axios.get(`/api/appointment/opd/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(reg);
    dispatch(setOpdAppointments(opd.data));
  } catch (error) {
    toast.error("Sync failed");
  } finally {
    dispatch(setLoading(false));
  }
}, [dispatch, userId, token]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // RESET PAGINATION ON FILTER
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, activeTab]);

  const handleStatusUpdate = async (appointid: string, newStatus: string) => {
    try {
      const url = activeTab === "regular" ? "/api/appointment/status" : "/api/appointment/opd/status";
      const payload = activeTab === "regular" ? { appointid, status: newStatus } : { appointmentId: appointid, status: newStatus };
      await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Marked as ${newStatus}`);
      refreshData();
    } catch (error) { toast.error("Update failed"); }
  };

  // --- THE MASTER FIX: NO HIDING, ONLY BRANCHING ---
  const processedList = useMemo(() => {
    const rawList = (activeTab === "regular" ? appointments : (opdAppointments as Appointment[])) || [];

    // Sort by Date (Newest First)
    const sorted = [...rawList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Track seen patients to draw branches
    const seenPatients = new Set();
    return sorted.map(app => {
      const isNewBranch = seenPatients.has(app.userId._id);
      seenPatients.add(app.userId._id);
      return { ...app, isHistory: isNewBranch };
    });
  }, [activeTab, appointments, opdAppointments]);

  const filteredPatients = useMemo(() => {
    return processedList.filter((app) => {
      const fullName = `${app.userId.firstname} ${app.userId.lastname}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [processedList, searchTerm, statusFilter]);

  const paginatedPatients = filteredPatients.slice((currentPage - 1) * PerPage, currentPage * PerPage);

  return (
    <div className="wrapper">
      <Navbar />
      <section className="container catalog-section">
        <div className="catalog-header">
          <h2 className="page-heading">Live Patient Stream</h2>
          <div className="stats-pill-modern">
            <FiActivity /> <span>{filteredPatients.length} Total Bookings</span>
          </div>
        </div>

        <div className="catalog-controls">
          <div className="tab-switcher">
            <button className={activeTab === "regular" ? "active" : ""} onClick={() => setActiveTab("regular")}>Regular</button>
            <button className={activeTab === "opd" ? "active" : ""} onClick={() => setActiveTab("opd")}>OPD</button>
          </div>
          <div className="search-bar-modern">
            <FiSearch />
            <input type="text" placeholder="Search patients..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="status-dropdown" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Events</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {loading ? <Loading /> : (
          <div className="catalog-list branch-layout">
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((app) => (
                <div key={app._id} className={`catalog-row ${app.isHistory ? 'history-branch' : 'master-node'} ${app.status.toLowerCase()}`}>

                  {/* VISUAL BRANCH INDICATOR */}
                  <div className="branch-visual">
                    {app.isHistory ? <div className="branch-line"></div> : <div className="master-dot"></div>}
                    <div className="node-icon">{app.isHistory ? <FiGitBranch /> : <FiGitCommit />}</div>
                  </div>

                  <div className="col-patient">
                    <img src={app.userId.pic} alt="avatar" className="catalog-avatar" />
                    <div className="patient-meta">
                      <span className="p-name">{app.userId.firstname} {app.userId.lastname}</span>
                      <span className="p-id">{app.isHistory ? "Previous Visit" : "Primary Session"}</span>
                    </div>
                  </div>

                  <div className="col-status">
                    <span className={`status-tag ${app.status.toLowerCase()}`}>{app.status}</span>
                  </div>

                  <div className="col-date">
                    <div className="date-box"><FiCalendar /> <span>{app.date}</span></div>
                  </div>

                  <div className="col-actions">
                    <div className="action-btns">
                      {app.status === "Pending" && (
                        <>
                          <button className="icon-btn check" onClick={() => handleStatusUpdate(app._id, "Accepted")}><FiCheck /></button>
                          <button className="icon-btn cross" onClick={() => handleStatusUpdate(app._id, "Discarded")}><FiX /></button>
                        </>
                      )}
                      {app.status === "Accepted" && (
                        <>
                          <button className="btn-action-lab" onClick={() => { setSelectedPatient(app.userId); setLabModalOpen(true); }}><FiActivity /> Lab</button>
                          <button className="btn-action-done" onClick={() => handleStatusUpdate(app._id, "Completed")}>Done</button>
                        </>
                      )}
                      {app.status === "Completed" && (
                        <>
                          <button className="btn-action-prescription" onClick={() => { setSelectedPatient(app.userId); setSelectedAppId(app._id); setPrescModalOpen(true); }}><FiFileText /> Rx</button>
                          <button className="btn-outline-small" onClick={() => { setSelectedDoctor(app.doctorId); setModalOpen(true); }}>Follow-up</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : <Empty message="No matching records found" />}
          </div>
        )}

        {filteredPatients.length > PerPage && (
          <div className="catalog-pagination">
            {Array.from({ length: Math.ceil(filteredPatients.length / PerPage) }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? "active" : ""}>{i + 1}</button>
            ))}
          </div>
        )}
      </section>
      <Footer />

      {/* MODALS RENDERED AT ROOT TO PREVENT CLIPPING */}
      {modalOpen && selectedDoctor && <BookAppointment setModalOpen={setModalOpen} ele={{ userId: selectedDoctor }} />}
      {labModalOpen && selectedPatient && <RequestLab setModalOpen={setLabModalOpen} patientId={selectedPatient._id} patientName={`${selectedPatient.firstname} ${selectedPatient.lastname}`} />}
      {prescModalOpen && selectedPatient && <PrescriptionModal setModalOpen={setPrescModalOpen} patientId={selectedPatient._id} patientName={`${selectedPatient.firstname} ${selectedPatient.lastname}`} appointmentId={selectedAppId} />}
    </div>
  );
};

export default Appointments;
