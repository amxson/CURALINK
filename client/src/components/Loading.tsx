// Loading.tsx
import React from 'react';
import "../styles/loading.css"; // Ensure this path is correct

const Loading: React.FC = () => {
  return (
    <div className="loading">
      <div className="loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loading;
