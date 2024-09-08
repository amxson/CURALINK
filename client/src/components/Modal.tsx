import React, { ReactNode } from 'react';
import '../styles/modal.css'; // Make sure you have this CSS file for styling

// Define the prop types for the Modal component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode; // ReactNode is used for any valid React children
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
