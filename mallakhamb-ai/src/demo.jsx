function DetectorView() {
  const [mode, setMode] = useState("image"); // image, video, camera
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

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
