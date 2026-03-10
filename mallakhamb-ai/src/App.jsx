import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";
import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  PlayCircle,
  BarChart2,
  Activity,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  X,
  Crosshair,
  List,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// --- MOCK DATA ---
const POSE_LIBRARY = [
  {
    id: 1,
    name: "Veerasana",
    difficulty: "Beginner",
    benefits: ["Core strength", "Balance"],
    desc: "A foundational upright pose sitting on the pole.",
  },
  {
    id: 2,
    name: "Padmasana",
    difficulty: "Intermediate",
    benefits: ["Flexibility", "Focus"],
    desc: "A balanced inverted pose performed by gripping the pole with legs.",
  },
  {
    id: 3,
    name: "Hanuman Pose",
    difficulty: "Advanced",
    benefits: ["Full body control", "Agility"],
    desc: "A dynamic leap and grip position resembling the monkey god.",
  },
  {
    id: 4,
    name: "Garudasana",
    difficulty: "Intermediate",
    benefits: ["Leg grip strength", "Joint mobility"],
    desc: "Twisted limb grip around the pole.",
  },
  {
    id: 5,
    name: "Natarajasana",
    difficulty: "Expert",
    benefits: ["Spinal flexibility", "Supreme balance"],
    desc: "The dancer pose balanced horizontally.",
  },
];

const RECENT_RESULTS = [
  { pose: "Padmasana", accuracy: 92, date: "04/18/2026" },
  { pose: "Veerasana", accuracy: 88, date: "04/17/2026" },
];

export default function App() {
  const [currentView, setCurrentView] = useState("hero"); // hero, detector, library

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-50 font-sans overflow-hidden selection:bg-orange-500 selection:text-white flex flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .wood-texture {
          background: linear-gradient(90deg, #3e2723 0%, #5d4037 20%, #4e342e 50%, #5d4037 80%, #3e2723 100%);
          box-shadow: inset -10px 0 20px rgba(0,0,0,0.8), inset 10px 0 20px rgba(255,255,255,0.1);
        }
        .grid-floor {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(249, 115, 22, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.1) 1px, transparent 1px);
          transform: perspective(500px) rotateX(60deg);
        }
        .glass-panel {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `,
        }}
      />

      {/* NAVBAR */}
      <nav className="h-20 w-full z-50 glass-panel border-b border-slate-800/50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView("hero")}
          >
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(234,88,12,0.4)]">
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white">
                MALLAKHAMB<span className="text-orange-500">.AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-bold">
                Pose Accuracy Analyzer
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-300 overflow-y-auto custom-scroll relative">
            <button
              onClick={() => setCurrentView("hero")}
              className={`hover:text-orange-500 transition-colors ${currentView === "hero" ? "text-orange-500" : ""}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView("detector")}
              className={`hover:text-orange-500 transition-colors ${currentView === "detector" ? "text-orange-500" : ""}`}
            >
              Detector App
            </button>
            <button
              onClick={() => setCurrentView("library")}
              className={`hover:text-orange-500 transition-colors ${currentView === "library" ? "text-orange-500" : ""}`}
            >
              Pose Library
            </button>
            <button
              onClick={() => setCurrentView("detector")}
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center gap-2 group"
            >
              Start Detection{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow overflow-y-auto custom-scroll relative">
        {currentView === "hero" && <HeroView setView={setCurrentView} />}
        {currentView === "detector" && <DetectorView />}
        {currentView === "library" && <LibraryView />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 Sthambhadrushti • Advanced Motion Analysis Framework</p>
      </footer>
    </div>
  );
}

// --- HERO COMPONENT ---
function HeroView({ setView }) {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden flex items-center">
      {/* Background Grid Floor */}
      <div className="absolute bottom-0 w-[200%] left-[-50%] h-[60vh] grid-floor opacity-30 z-0 pointer-events-none"></div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[150px] opacity-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-600 rounded-full blur-[150px] opacity-5 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center z-10">
        {/* Left Text Content */}
        <div className="space-y-8 relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            <Zap size={14} /> Next-Gen Sports AI
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Master The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
              Mallakhamb
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            Upload images, video, or use your live camera. Our state-of-the-art
            computer vision model instantly analyzes your pose, alignment, and
            balance with pinpoint accuracy.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => setView("detector")}
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all flex items-center gap-3 transform hover:-translate-y-1"
            >
              <Crosshair size={20} />
              Launch Detector
            </button>
            <button
              onClick={() => setView("library")}
              className="glass-panel hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 border border-slate-700"
            >
              <List size={20} />
              View Pose Library
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6 pt-12 border-t border-slate-800/50 mt-12">
            <div>
              <div className="text-3xl font-black text-white mb-1">98.5%</div>
              <div className="text-sm text-slate-500 font-medium">
                Detection Accuracy
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">
                &lt; 50ms
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Real-time Latency
              </div>
            </div>
          </div>
        </div>

        {/* Right 3D Art Content */}
        <div className="relative h-[600px] hidden md:flex justify-center items-center perspective-1000">
          {/* AI Scan Rings */}
          <div className="absolute w-[450px] h-[450px] border border-orange-500/10 rounded-full animate-[spin_15s_linear_infinite] transform rotate-x-75"></div>
          <div className="absolute w-[350px] h-[350px] border border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite_reverse] transform rotate-x-75"></div>

          {/* The Mallakhamb Pole */}
          <div className="absolute w-12 h-[550px] wood-texture rounded-t-full preserve-3d shadow-[20px_0_40px_rgba(0,0,0,0.6)] z-10">
            <div className="absolute bottom-0 w-full h-8 bg-black/60 rounded-b-sm"></div>
          </div>

          {/* Athletic Black Silhouette */}
          <div className="absolute z-20 animate-float drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <svg
              width="400"
              height="400"
              viewBox="0 0 200 200"
              className="transform -translate-y-12 translate-x-12"
            >
              <defs>
                <linearGradient
                  id="bodyGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <filter id="neonGlow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Silhouette Path */}
              <g
                stroke="#f97316"
                strokeWidth="0.5"
                fill="url(#bodyGrad)"
                filter="url(#neonGlow)"
              >
                <path d="M 100 80 C 110 75, 125 78, 135 85 C 145 92, 140 100, 130 105 C 115 112, 95 110, 85 105 C 80 102, 85 95, 95 88 Z" />
                <circle cx="145" cy="80" r="8" />
                <path
                  d="M 120 85 C 100 70, 75 75, 65 80 L 60 85"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 115 100 C 95 105, 75 95, 65 90 L 60 85"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 90 95 C 70 100, 40 105, 20 100"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 85 105 C 65 115, 35 125, 15 115"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* AI Skeleton Overlay */}
              <g stroke="#10b981" strokeWidth="1.2" fill="none">
                <circle cx="145" cy="80" r="2.5" fill="#10b981" />
                <circle cx="120" cy="85" r="2.5" fill="#10b981" />
                <circle cx="90" cy="95" r="2.5" fill="#10b981" />
                <circle cx="65" cy="80" r="2.5" fill="#10b981" />
                <circle cx="20" cy="100" r="2.5" fill="#10b981" />
                <path
                  d="M 145 80 L 120 85 L 90 95 L 65 80"
                  strokeDasharray="3,3"
                />
                <path d="M 90 95 L 20 100" strokeDasharray="3,3" />
              </g>

              {/* Scanning Laser */}
              <rect
                x="0"
                y="40"
                width="200"
                height="1.5"
                fill="#f97316"
                className="animate-scan"
              />
            </svg>
          </div>

          {/* Floating UI Badges */}
          <div
            className="absolute top-20 right-10 glass-panel p-4 rounded-xl animate-float flex items-center gap-3 border border-emerald-500/20"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="text-emerald-500" size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Alignment
              </div>
              <div className="text-sm font-bold text-emerald-400">Perfect</div>
            </div>
          </div>

          <div
            className="absolute bottom-32 left-0 glass-panel p-4 rounded-xl animate-float flex items-center gap-3 border border-orange-500/20"
            style={{ animationDelay: "2.5s" }}
          >
            <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Activity className="text-orange-500" size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Active Pose
              </div>
              <div className="text-sm font-bold text-white">Dhwajasana</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- DETECTOR COMPONENT ---

function DetectorView() {
  // 1. Add these refs and state at the top of your function
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [mode, setMode] = useState("image"); // image, video, camera
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  // camera access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  // simulateDetection
  const simulateDetection = () => {
    setIsProcessing(true);
    setResult(null);
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        pose: "Padmasana Mallakhamb",
        accuracy: 94,
        status: "Correct Alignment",
        desc: "An advanced balance performed by gripping the pole with legs while maintaining an upright posture.",
        timeline: [
          { time: "00:02", pose: "Veerasana", status: "Detected" },
          { time: "00:06", pose: "Padmasana", status: "Perfected" },
          { time: "00:10", pose: "Hanuman Pose", status: "Attempted" },
        ],
      });
    }, 2800);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white flex items-center gap-4">
          <div className="p-2 bg-orange-500 rounded-lg shadow-lg">
            <Crosshair className="text-white" size={28} />
          </div>
          AI Detection Studio
        </h2>
        <p className="text-slate-400 mt-2 text-lg">
          Harness the power of PoseNet for traditional athletic analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selector */}
          <div className="glass-panel p-2 rounded-2xl flex gap-2 border border-slate-800">
            {[
              { id: "image", icon: ImageIcon, label: "Image" },
              { id: "video", icon: Video, label: "Video" },
              { id: "camera", icon: Camera, label: "Live" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                  mode === m.id
                    ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                <m.icon size={18} /> {m.label}
              </button>
            ))}
          </div>

          {/* Media Stage */}
          <div className="glass-panel border border-slate-800 rounded-3xl p-8 h-[500px] flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Input States */}
            {!isProcessing && !result && (
              <div className="text-center w-full max-w-md">
                <div className="w-28 h-28 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-dashed border-slate-700 group-hover:border-orange-500 transition-all duration-500 group-hover:scale-105">
                  {mode === "image" && (
                    <Upload
                      size={40}
                      className="text-slate-600 group-hover:text-orange-500 transition-colors"
                    />
                  )}
                  {mode === "video" && (
                    <PlayCircle
                      size={40}
                      className="text-slate-600 group-hover:text-orange-500 transition-colors"
                    />
                  )}
                  {mode === "camera" && (
                    <Camera
                      size={40}
                      className="text-slate-600 group-hover:text-orange-500 transition-colors"
                    />
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-3">Ready to Analyze</h3>
                <p className="text-slate-500 mb-8 px-8 leading-relaxed">
                  {mode === "image" &&
                    "Upload a photo of a Mallakhamb pose to identify the posture and check alignment."}
                  {mode === "video" &&
                    "Upload a session video to extract a timeline of all poses performed."}
                  {mode === "camera" &&
                    "Allow camera access for real-time skeletal tracking and feedback."}
                </p>
                <button
                  onClick={simulateDetection}
                  className="bg-slate-50 text-slate-950 hover:bg-white px-10 py-4 rounded-xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                >
                  {mode === "camera" ? "Open Camera" : "Choose File"}
                </button>
              </div>
            )}

            {/* Processing Stage */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-20">
                <div className="relative w-72 h-72 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center bg-black">
                  <div className="absolute w-10 h-full bg-gradient-to-r from-orange-950/20 to-orange-500/10 left-1/2 -translate-x-1/2 blur-md"></div>
                  <Activity
                    size={60}
                    className="text-slate-800 animate-pulse"
                  />
                  <div className="absolute left-0 w-full h-[2px] bg-orange-500 shadow-[0_0_20px_#f97316] animate-scan z-30"></div>

                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-orange-500/50"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-orange-500/50"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-500/50"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-orange-500/50"></div>
                </div>
                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-orange-500 font-mono tracking-[0.3em] text-xs font-black uppercase">
                    Identifying Pose Geometry
                  </span>
                </div>
              </div>
            )}

            {/* Result Stage */}
            {result && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-10 p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-slate-950 to-slate-950"></div>
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-lg h-full relative border border-emerald-500/20 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-900/50 shadow-2xl">
                    {/* Pole */}
                    <div className="absolute w-10 h-full bg-gradient-to-r from-[#2a1b18] to-[#3e2723] left-1/2 -translate-x-1/2"></div>

                    {/* Skeleton SVG Result */}
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 100 100"
                      className="relative z-20"
                    >
                      <circle cx="50" cy="30" r="5" fill="#10b981" />
                      <g stroke="#10b981" strokeWidth="3" strokeLinecap="round">
                        <line x1="50" y1="35" x2="50" y2="65" />
                        <line x1="50" y1="45" x2="30" y2="55" />
                        <line x1="50" y1="45" x2="70" y2="55" />
                        <line x1="50" y1="65" x2="35" y2="85" />
                        <line x1="50" y1="65" x2="65" y2="85" />
                      </g>
                      {/* Joint markers */}
                      {[
                        [50, 45],
                        [30, 55],
                        [70, 55],
                        [50, 65],
                        [35, 85],
                        [65, 85],
                      ].map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="2" fill="#fff" />
                      ))}
                    </svg>

                    {/* Analysis Overlays */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border border-emerald-500/30">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase text-emerald-400">
                        Stable Center
                      </span>
                    </div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border border-orange-500/30">
                      <AlertCircle size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-orange-400">
                        Lift Leg +3°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Timeline View */}
          {mode === "video" && result && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
                Pose Extraction Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-orange-500/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-orange-500 font-mono text-sm font-bold">
                        {item.time}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-200 group-hover:text-white">
                      {item.pose}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Analysis */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
            {result && (
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/10 rounded-full blur-[80px]"></div>
            )}

            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <BarChart2 className="text-orange-500" />
              Live Analysis
            </h3>

            {result ? (
              <div className="space-y-8 relative z-10">
                <div className="pb-6 border-b border-slate-800">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    Detected Geometry
                  </div>
                  <div className="text-3xl font-black text-white">
                    {result.pose}
                  </div>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                      Confidence
                    </div>
                    <div className="text-4xl font-black text-emerald-400">
                      {result.accuracy}%
                    </div>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-900"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="213"
                        strokeDashoffset={213 - (213 * result.accuracy) / 100}
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="text-emerald-500/50" size={24} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
                    AI Insights
                  </div>
                  <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 text-sm leading-relaxed text-slate-400 italic">
                    "{result.desc}"
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                >
                  <X size={18} /> Reset Detector
                </button>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center opacity-40 py-12">
                <div className="w-20 h-20 rounded-full border border-slate-800 flex items-center justify-center mb-6 animate-pulse">
                  <Activity size={32} className="text-slate-600" />
                </div>
                <p className="text-sm font-medium">
                  Awaiting input stream...
                  <br />
                  Geometric data will map here.
                </p>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
              History Log
            </h3>
            <div className="space-y-3">
              {RECENT_RESULTS.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 hover:bg-slate-900 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-white transition-colors">
                        {res.pose}
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase">
                        {res.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-emerald-500 font-black text-sm">
                    {res.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LIBRARY COMPONENT ---
function LibraryView() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl font-black text-white mb-6">
          Knowledge <span className="text-orange-500">Repository</span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed">
          Explore standardized Mallakhamb postures. These references form the
          baseline for our AI's geometric validation models.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSE_LIBRARY.map((pose) => (
          <div
            key={pose.id}
            className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-orange-500/30 transition-all hover:-translate-y-2 group overflow-hidden relative"
          >
            {/* Background number */}
            <div className="absolute -top-4 -right-4 text-9xl font-black text-white/5 pointer-events-none group-hover:text-orange-500/5 transition-colors">
              {pose.id}
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">
                {pose.name}
              </h3>
              <span
                className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${
                  pose.difficulty === "Beginner"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : pose.difficulty === "Intermediate"
                      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {pose.difficulty}
              </span>
            </div>

            <div className="mb-8 relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info size={12} /> Definition
              </div>
              <p className="text-slate-400 text-sm leading-relaxed h-12 overflow-hidden">
                {pose.desc}
              </p>
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Training Benefits
              </div>
              <div className="flex flex-wrap gap-2">
                {pose.benefits.map((benefit, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-lg"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
//export default App;
