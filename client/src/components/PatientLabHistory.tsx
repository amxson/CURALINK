import React, { useEffect, useState } from "react";
import axios from "axios";

const PatientLabHistory = ({ userId }: { userId: string }) => {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchMyLabs = async () => {
      const { data } = await axios.get(`/api/lab/patient/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLabs(data);
    };
    fetchMyLabs();
  }, [userId]);

  return (
    <div className="lab-history-container">
      <h3>My Medical Reports</h3>
      {labs.map((lab: any) => (
        <div key={lab._id} className="report-card" style={{border: '1px solid #ddd', padding: '15px', margin: '10px 0'}}>
          <h4>{lab.testName} ({lab.category})</h4>
          <p><strong>Status:</strong> {lab.status}</p>
          {lab.status === "Ready" && (
            <>
              <p><strong>Technician Note:</strong> {lab.testResult}</p>
              <a href={lab.resultFile} download={`Report-${lab.testName}.png`} className="btn" style={{color: 'blue'}}>
                View/Download Report
              </a>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
