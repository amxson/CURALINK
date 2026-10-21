import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import UploadResultModal from "./UploadResultModal";
import { FiFileText, FiUser, FiLayers, FiInfo, FiCheckCircle, FiFolder } from "react-icons/fi";
import "../styles/labworklist.css";

const LabWorklist: React.FC = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);

  const fetchLabRequests = async () => {
    try {
      const { data } = await axios.get("/api/lab/all-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(data);
    } catch (error) {
      toast.error("Failed to load lab requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLabRequests(); }, []);

  // GROUPING LOGIC: Organizes requests by Patient Name
  const groupedRequests = requests.reduce((acc: any, curr: any) => {
    const patientName = `${curr.patientId?.firstname} ${curr.patientId?.lastname}`;
    if (!acc[patientName]) acc[patientName] = [];
    acc[patientName].push(curr);
    return acc;
  }, {});

  if (loading) return <div className="loading-state">Organizing Catalog...</div>;

  return (
    <div className="lab-worklist-container">
      {Object.keys(groupedRequests).length > 0 ? (
        Object.keys(groupedRequests).map((patient) => (
          <div key={patient} className="patient-catalog-group">
            {/* Patient Header (The Book Cover) */}
            <div className="patient-section-header">
              <FiFolder className="folder-icon" />
              <h3>{patient}</h3>
              <span className="count-badge">{groupedRequests[patient].length} Pending Tests</span>
            </div>

            {/* The Tests inside that Patient's "Book" */}
            <div className="lab-grid">
              {groupedRequests[patient].map((req: any) => (
                <div className="lab-card" key={req._id}>
                  <div className="lab-card-header">
                    <span className="order-id">ID: {req.orderId}</span>
                    <span className="category-tag">{req.category}</span>
                  </div>

                  <div className="lab-card-body">
                    <p className="test-title">{req.testName}</p>
                    {req.description && (
                      <p className="test-desc"><strong>Notes:</strong> {req.description}</p>
                    )}
                  </div>

                  <button className="upload-action-btn" onClick={() => setSelectedLab(req._id)}>
                    <FiCheckCircle /> Upload Result
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">No pending requests in the catalog.</div>
      )}

      {selectedLab && (
        <UploadResultModal
          labId={selectedLab}
          onClose={() => setSelectedLab(null)}
          onSuccess={fetchLabRequests}
        />
      )}
    </div>
  );
};

export default LabWorklist;
