import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { FiActivity } from "react-icons/fi";

interface RequestLabProps {
  setModalOpen: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

const RequestLab: React.FC<RequestLabProps> = ({ setModalOpen, patientId, patientName }) => {
  const [formDetails, setFormDetails] = useState({
    testName: "",
    category: "Blood Work",
    description: "",
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const inputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({ ...prev, [name]: value }));
  };

  const requestTest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.post(
          "/api/lab/request",
          {
            patientId,
            testName: formDetails.testName,
            category: formDetails.category,
            description: formDetails.description,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        ),
        {
          success: "Lab test requested successfully!",
          error: "Unable to request lab test",
          loading: "Sending request to laboratory...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      console.error("Lab Request Error:", error);
    }
  };

  return (
    <div className="modal" onClick={() => setModalOpen(false)}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setModalOpen(false)}>
          <IoClose size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            background: '#ebf5ff',
            color: '#3498db',
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <FiActivity size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Order Lab Test</h2>
          <p style={{ color: "#64748b", fontSize: '0.9rem', marginTop: '5px' }}>
            Ordering for: <span style={{ color: '#0f172a', fontWeight: 700 }}>{patientName}</span>
          </p>
        </div>

        <form className="register-form" onSubmit={requestTest}>
          <div className="form-group">
            <label className="form-label">Test Name</label>
            <input
              type="text"
              name="testName"
              className="form-input"
              placeholder="e.g. Full Blood Count"
              value={formDetails.testName}
              onChange={inputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-input"
              value={formDetails.category}
              onChange={inputChange}
              required
            >
              <option value="Blood Work">Blood Work</option>
              <option value="Imaging">Imaging (X-Ray/CT)</option>
              <option value="Scan">Scan (Ultrasound/MRI)</option>
              <option value="Urine Test">Urine Test</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions / Clinical Notes</label>
            <textarea
              name="description"
              className="form-input"
              style={{ minHeight: '100px', resize: 'none' }}
              placeholder="Provide details for the technician..."
              value={formDetails.description}
              onChange={inputChange}
            />
          </div>

          <button type="submit" className="form-btn" style={{ background: '#3498db' }}>
            Send to Lab
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestLab;
