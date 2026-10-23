import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AddStaff: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "Doctor",
    specialization: "General Practitioner",
    experience: "",
    fees: "",
  });

  const specializations = [
    "General Practitioner", "Neurologist", "Cardiologist", "ENT Specialist",
    "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Gynecologist",
    "Psychiatrist", "Ophthalmologist", "Urologist", "Oncologist",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/user/add-staff", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(`${formData.role} account created and profile synced!`);
      setFormData({
        firstname: "", lastname: "", email: "", password: "",
        role: "Doctor", specialization: "General Practitioner", experience: "", fees: ""
      });
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to add staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container staff-form-section">
      <div className="staff-form-card" style={{maxWidth: "700px", margin: "0 auto", padding: "2rem", background: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}>
        <h2 className="page-heading" style={{textAlign: "center", marginBottom: "2rem"}}>Register New Staff</h2>

        <form onSubmit={handleSubmit} className="staff-form">
          <div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem", marginBottom: "1rem"}}>
            <input type="text" name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} required className="form-input" />
            <input type="text" name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required className="form-input" />
          </div>

          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="form-input" style={{width: "100%", marginBottom: "1rem"}} />

          <input type="password" name="password" placeholder="Temporary Password" value={formData.password} onChange={handleChange} required className="form-input" style={{width: "100%", marginBottom: "1rem"}} />

          <div style={{marginBottom: "1rem"}}>
            <label style={{fontSize: "0.9rem", color: "#64748b"}}>Assign Role:</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-input" style={{width: "100%"}}>
              <option value="Doctor">Doctor</option>
              <option value="Technician">Lab Technician</option>
            </select>
          </div>

          {formData.role === "Doctor" && (
            <div style={{borderLeft: "4px solid #3b82f6", paddingLeft: "1rem", marginTop: "1rem"}}>
              <p style={{fontWeight: "bold", fontSize: "0.9rem", marginBottom: "0.5rem"}}>Doctor Profile Details:</p>
              <select name="specialization" value={formData.specialization} onChange={handleChange} className="form-input" style={{width: "100%", marginBottom: "1rem"}}>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem"}}>
                <input type="number" name="experience" placeholder="Exp (Years)" value={formData.experience} onChange={handleChange} required className="form-input" />
                <input type="number" name="fees" placeholder="Consultation Fee" value={formData.fees} onChange={handleChange} required className="form-input" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn" style={{width: "100%", marginTop: "2rem", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}>
            {loading ? "Creating Account..." : `Register ${formData.role}`}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddStaff;
