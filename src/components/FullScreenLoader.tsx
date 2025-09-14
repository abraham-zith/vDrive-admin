import React from "react";

const FullScreenLoader: React.FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(255,255,255,0.85)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      className="loader"
      style={{
        border: "8px solid #f3f3f3",
        borderTop: "8px solid #1d2a5c",
        borderRadius: "50%",
        width: 64,
        height: 64,
        animation: "spin 1s linear infinite",
      }}
    />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
    </style>
  </div>
);

export default FullScreenLoader;
