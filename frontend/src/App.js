import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import DetectionMenu from "./components/DetectionMenu";
import UploadImage from "./components/UploadImage";
import UploadVideo from "./components/UploadVideo";
import LiveCamera from "./components/LiveCamera";
import PoseLibrary from "./components/PoseLibrary";

import "./styles/style.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detect" element={<DetectionMenu />} />
        <Route path="/upload-image" element={<UploadImage />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/live-camera" element={<LiveCamera />} />
        <Route path="/library" element={<PoseLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
