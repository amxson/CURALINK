import { createPortal } from "react-dom";
import "../styles/loading.css";

const Loading: React.FC = () => {
  return createPortal(
    <div className="loading-overlay">
      <div className="loader">
        <span />
        <span />
        <span />
      </div>
    </div>,
    document.body
  );
};

export default Loading;
