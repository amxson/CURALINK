import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import "../styles/notification.css";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import {
  FiDownload,
  FiBell,
  FiActivity,
  FiFileText,
  FiCheckCircle,
  FiChevronRight,
  FiChevronLeft,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";

const LabStatusTracker = ({ status }: { status: string }) => {
  const steps = [
    { label: "Pending", key: "pending" },
    { label: "In Lab", key: "in progress" },
    { label: "Ready", key: "ready" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === status.toLowerCase());

  return (
    <div className="tracker-row">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div
            className={`tracker-node ${index <= currentIdx ? "active" : ""}`}
          >
            <div className="node-dot">
              {index < currentIdx ? <FiCheckCircle /> : index + 1}
            </div>
            <span className="node-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`node-connector ${index < currentIdx ? "active" : ""}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const [notifPage, setNotifPage] = useState(1);
  const notifsPerPage = 4;

  const { userInfo } = useSelector((state: any) => state.root);
  const isDoctor = userInfo?.role === "Doctor";

  const scrollRefLabs = useRef<HTMLDivElement>(null);
  const scrollRefPresc = useRef<HTMLDivElement>(null);

  const groupByPatient = (reports: any[]) => {
    return reports.reduce((acc: any, report: any) => {
      const patientName = `${report.patientId?.firstname || "Unknown"} ${
        report.patientId?.lastname || "Patient"
      }`;
      if (!acc[patientName]) acc[patientName] = [];
      acc[patientName].push(report);
      return acc;
    }, {});
  };

  const getPageData = useCallback(async () => {
    const id = userInfo?._id || userInfo?.userId;
    if (!id) return;
    try {
      setLocalLoading(true);
      const [notifs, labs] = await Promise.all([
        fetchData(`api/notification/getallnotifs`),
        fetchData(
          isDoctor ? `api/lab/doctor-ordered/${id}` : `api/lab/patient/${id}`,
        ),
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setLabReports(Array.isArray(labs) ? labs : []);

      if (!isDoctor) {
        const presc = await fetchData(`api/prescription/patient/${id}`);
        setPrescriptions(Array.isArray(presc) ? presc : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocalLoading(false);
    }
  }, [userInfo?._id, userInfo?.userId, isDoctor]);

  useEffect(() => {
    if (userInfo?._id || userInfo?.userId) getPageData();
  }, [userInfo?._id, userInfo?.userId, getPageData]);

  const handleDownload = async (reportId: string, testName: string) => {
    try {
      toast.loading("Preparing your report...");
      const base = process.env.REACT_APP_SERVER_DOMAIN || "";

      const cleanBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(`${cleanBase}api/lab/download/${reportId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("File not found");
      const data = await response.json();
      const downloadLink = document.createElement("a");
      downloadLink.href = data.fileData;
      downloadLink.download =
        data.fileName || `${testName.replace(/\s+/g, "_")}_Report`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.dismiss();
      toast.success("Download started!");
    } catch (error) {
      toast.dismiss();
      toast.error("Could not retrieve the report.");
    }
  };

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // --- FIXED: sort notifications first, then paginate ---
  const sortedNotifs = [...notifications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const lastIdx = notifPage * notifsPerPage;
  const firstIdx = lastIdx - notifsPerPage;
  const currentNotifs = sortedNotifs.slice(firstIdx, lastIdx);
  const totalPages = Math.ceil(notifications.length / notifsPerPage);

  const groupedReports = isDoctor ? groupByPatient(labReports) : {};

  return (
    <div className="wrapper">
      <Navbar />
      <div className="content">
        <section className="container action-center-section">
          <div className="action-center-header">
            <h2 className="page-heading">
              {isDoctor ? "Doctor Command Center" : "Action Center"}
            </h2>
            <p className="sub-heading">
              {isDoctor
                ? "Oversee and track all patient diagnostic requests in real-time"
                : "Live tracking of your diagnostic requests"}
            </p>
          </div>

          <div className="two-column-layout">
            <div className="column-box left-side">
              <div className="column-header">
                <div className="title-wrapper">
                  <div className="icon-circle medical">
                    <FiActivity />
                  </div>
                  <h3>{isDoctor ? "Active Patient Orders" : "Lab Progress"}</h3>
                </div>
                {!isDoctor && (
                  <div className="carousel-nav">
                    <button
                      onClick={() => scroll(scrollRefLabs, "left")}
                      className="nav-arrow"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => scroll(scrollRefLabs, "right")}
                      className="nav-arrow"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>

              <div
                className={
                  isDoctor ? "doctor-grouped-container" : "carousel-wrapper"
                }
                ref={scrollRefLabs}
              >
                {localLoading ? (
                  <Loading />
                ) : isDoctor ? (
                  Object.keys(groupedReports).length > 0 ? (
                    Object.entries(groupedReports).map(
                      ([patientName, reports]: any) => (
                        <div
                          key={patientName}
                          className="patient-group-wrapper"
                        >
                          <div className="patient-header">
                            <FiUser /> <span>{patientName}</span>
                          </div>
                          <div className="patient-reports-grid">
                            {reports.map((report: any) => (
                              <div
                                key={report._id}
                                className="glass-card tracker-card doc-view-card"
                              >
                                <div className="card-top-row">
                                  <div className="card-info">
                                    <p className="item-name">
                                      {report.testName}
                                    </p>
                                    <span
                                      className={`status-pill ${report.status
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                    >
                                      {report.status}
                                    </span>
                                  </div>
                                  {report.status.toLowerCase() === "ready" && (
                                    <button
                                      className="download-btn-modern mini"
                                      onClick={() =>
                                        handleDownload(
                                          report._id,
                                          report.testName,
                                        )
                                      }
                                    >
                                      <FiDownload />
                                    </button>
                                  )}
                                </div>
                                <LabStatusTracker status={report.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <Empty message="No active orders found" />
                  )
                ) : labReports.length > 0 ? (
                  labReports.map((report) => (
                    <div
                      key={report._id}
                      className="glass-card tracker-card carousel-card"
                    >
                      <div className="card-top-row">
                        <div className="card-info">
                          <p className="item-name">{report.testName}</p>
                          <span className="item-date">
                            {new Date(report.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {report.status.toLowerCase() === "ready" && (
                          <button
                            className="download-btn-modern mini"
                            onClick={() =>
                              handleDownload(report._id, report.testName)
                            }
                          >
                            <FiDownload />
                          </button>
                        )}
                      </div>
                      <LabStatusTracker status={report.status} />
                    </div>
                  ))
                ) : (
                  <Empty message="No active reports" />
                )}
              </div>

              {!isDoctor && (
                <>
                  <div className="column-header" style={{ marginTop: "30px" }}>
                    <div className="title-wrapper">
                      <div
                        className="icon-circle medical"
                        style={{ background: "#faf5ff", color: "#a855f7" }}
                      >
                        <FiFileText />
                      </div>
                      <h3>Prescriptions</h3>
                    </div>
                    <div className="carousel-nav">
                      <button
                        onClick={() => scroll(scrollRefPresc, "left")}
                        className="nav-arrow"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        onClick={() => scroll(scrollRefPresc, "right")}
                        className="nav-arrow"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                  <div className="carousel-wrapper" ref={scrollRefPresc}>
                    {localLoading ? (
                      <Loading />
                    ) : prescriptions.length > 0 ? (
                      prescriptions.map((presc) => (
                        <div
                          key={presc._id}
                          className="glass-card carousel-card presc-card"
                        >
                          <div className="presc-header">
                            <div className="dr-info">
                              <span className="dr-label">Physician</span>
                              <p className="dr-name">
                                Dr. {presc.doctorId?.lastname}
                              </p>
                            </div>
                            <span className="presc-date">
                              {new Date(presc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="med-list-container">
                            <p className="section-title">Medications</p>
                            <div className="med-grid-compact">
                              {presc.medicines.map((med: any, idx: number) => (
                                <div key={idx} className="med-item-row">
                                  <div className="med-bullet" />
                                  <div className="med-details">
                                    <span className="med-name">{med.name}</span>
                                    {med.dosage && (
                                      <span className="med-dosage">{med.dosage}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="presc-footer">
                            <span className="presc-id">
                              ID: {presc._id.slice(-6).toUpperCase()}
                            </span>
                            <button className="view-details-link">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty message="No prescriptions" />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="column-box right-side">
              <div className="column-header">
                <div className="title-wrapper">
                  <div className="icon-circle alert">
                    <FiBell />
                  </div>
                  <h3>General Alerts</h3>
                </div>
                <span className="count-pill">{notifications.length}</span>
              </div>
              <div className="list-env">
                {localLoading ? (
                  <Loading />
                ) : currentNotifs.length > 0 ? (
                  currentNotifs.map((notif) => (
                    <div key={notif._id} className="glass-card alert-card">
                      <div className="alert-indicator" />
                      <div className="card-info">
                        <p className="item-content">{notif.content}</p>
                        <span className="item-date">
                          {new Date(notif.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty message="No alerts found" />
                )}
              </div>

              {totalPages > 1 && (
                <div className="modern-pagination">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={notifPage === i + 1 ? "active" : ""}
                      onClick={() => setNotifPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;
