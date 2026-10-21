import React, { useState } from "react";
import { FiX, FiPlus, FiTrash2, FiSend } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../styles/appoint.css"

interface Props {
  setModalOpen: (open: boolean) => void;
  patientId: string;
  patientName: string;
  appointmentId: string;
}

const PrescriptionModal: React.FC<Props> = ({ setModalOpen, patientId, patientName, appointmentId }) => {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);

  const addField = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);

  const removeField = (index: number) => {
    const values = [...medicines];
    values.splice(index, 1);
    setMedicines(values);
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const values: any = [...medicines];
    values[index][e.target.name] = e.target.value;
    setMedicines(values);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    // Ensure keys are: userId, appointmentId, medicines
    await axios.post("/api/prescription/create", {
      userId: patientId,
      appointmentId,
      medicines
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Prescription sent!");
    setModalOpen(false);
  } catch (error: any) {
    console.error("Submit Error:", error.response?.data);
    toast.error("Validation failed. Check console.");
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content prescription-modal">
        <div className="modal-header">
          <h3>Issue Prescription: {patientName}</h3>
          <button className="close-btn" onClick={() => setModalOpen(false)}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="med-list">
            {medicines.map((med, index) => (
              <div key={index} className="med-row">
                <input name="name" placeholder="Medicine Name" value={med.name} onChange={(e) => handleChange(index, e)} required />
                <input name="dosage" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => handleChange(index, e)} />
                <input name="frequency" placeholder="Freq (e.g. 1-0-1)" value={med.frequency} onChange={(e) => handleChange(index, e)} />
                <input name="duration" placeholder="Days" value={med.duration} onChange={(e) => handleChange(index, e)} />
                {medicines.length > 1 && (
                  <button type="button" className="delete-med" onClick={() => removeField(index)}><FiTrash2 /></button>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="btn-add-more" onClick={addField}>
            <FiPlus /> Add Another Medicine
          </button>

          <div className="modal-footer">
            <button type="submit" className="btn-submit-presc">
              <FiSend /> Confirm & Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
