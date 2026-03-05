import React, { useState } from "react";
import axios from "axios";

function UploadImage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadImage = async () => {
    const formData = new FormData();

    formData.append("image", file);

    const res = await axios.post("http://localhost:5000/predict", formData);

    setResult(res.data);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Upload Mallakhamb Pose Image</h2>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button className="orange-btn" onClick={uploadImage}>
          Upload Image
        </button>

        {result && (
          <div className="result">
            <h3>Pose Name : {result.pose}</h3>
            <h3>Accuracy : {result.accuracy}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadImage;
