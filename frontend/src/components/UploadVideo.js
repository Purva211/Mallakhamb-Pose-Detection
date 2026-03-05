import React from "react";

function UploadVideo() {
  return (
    <div className="container">
      <div className="card">
        <h2>Upload Mallakhamb Video</h2>

        <input type="file" />

        <button className="orange-btn">Upload Video</button>

        <p>Pose Timeline will appear here</p>
      </div>
    </div>
  );
}

export default UploadVideo;
