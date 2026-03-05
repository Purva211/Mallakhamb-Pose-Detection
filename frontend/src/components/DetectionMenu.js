import React from "react";
import { useNavigate } from "react-router-dom";

function DetectionMenu() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">
        <h2>Mallakhamb Pose Detection</h2>

        <button className="green-btn" onClick={() => navigate("/upload-image")}>
          Upload Image
        </button>

        <button className="green-btn" onClick={() => navigate("/upload-video")}>
          Upload Video
        </button>

        <button className="green-btn" onClick={() => navigate("/live-camera")}>
          Open Camera
        </button>
      </div>
    </div>
  );
}

export default DetectionMenu;
