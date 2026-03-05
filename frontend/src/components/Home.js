import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card home-card">
        <h1>
          Mallakhamb <span>Pose Detector</span>
        </h1>

        <p>AI Based Pose Detection & Accuracy Analyzer</p>

        <button className="green-btn" onClick={() => navigate("/detect")}>
          Start Detection
        </button>
      </div>
    </div>
  );
}

export default Home;
