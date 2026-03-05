import React from "react";

function LiveCamera() {
  return (
    <div className="container">
      <div className="card">
        <h2>Live Pose Detection</h2>

        <video width="500" controls />

        <p>Pose : Veerasana</p>
        <p>Accuracy : 88%</p>

        <button className="red-btn">Stop Camera</button>
      </div>
    </div>
  );
}

export default LiveCamera;
