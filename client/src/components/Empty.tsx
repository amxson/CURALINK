import React from "react";

interface EmptyProps {
  message: string;
}

const Empty: React.FC<EmptyProps> = ({ message }) => {
  return <h2 className="nothing flex-center">{message}</h2>;
};

export default Empty;
