import AppDialog from "./AppDialog";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX, FiUploadCloud, FiCheck, FiFile } from "react-icons/fi";
import "../styles/modal2.css";

interface Props {
  labId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadResultModal: React.FC<Props> = ({ labId, onClose, onSuccess }) => {
  const [testResult, setTestResult] = useState("");
  const [resultFile, setResultFile] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Convert file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { e.target.value = ""; return toast.error("Choose a file smaller than 5 MB."); }
      if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) { e.target.value = ""; return toast.error("Choose a PNG, JPG, WebP or PDF file."); }
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setResultFile(reader.result as string);
      };
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultFile) return toast.error("Please upload a result file (Image/PDF)");

    try {
      setUploading(true);

      await axios.put(
        "/api/lab/upload-result",
        {
          labId,
          testResult,
          resultFile,
          resultFileName: fileName
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      toast.success("Results uploaded and Patient notified!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to upload results");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppDialog label="Submit lab results" onClose={onClose}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>Submit Lab Results</h3>
          <button aria-label="Close dialog" type="button" className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Technician's Summary (Optional)</label>
            <textarea
              placeholder="Enter brief clinical summary..."
              value={testResult}
              onChange={(e) => setTestResult(e.target.value)}
            />
          </div>

          <div className={`file-upload-zone ${resultFile ? 'active' : ''}`}>
            <input
              type="file"
              id="file-input"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              hidden
            />
            <label htmlFor="file-input" className="file-label">
              {resultFile ? (
                <>
                  <FiFile className="upload-icon" />
                  <span>{fileName}</span>
                  <p>Click to change file</p>
                </>
              ) : (
                <>
                  <FiUploadCloud className="upload-icon" />
                  <span>Click to upload Lab Report</span>
                  <p>PNG, JPG, WebP or PDF (Max 5MB)</p>
                </>
              )}
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={uploading}>
              {uploading ? "Uploading..." : <><FiCheck /> Complete Order</>}
            </button>
          </div>
        </form>
      </div>
    </AppDialog>
  );
};

export default UploadResultModal;
