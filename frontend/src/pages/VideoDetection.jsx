import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, ProgressBar, Card } from 'react-bootstrap';
import { 
  FaFileVideo, FaDownload, FaChartLine, FaTrophy, 
  FaExclamationTriangle, FaPlay, FaPause, FaChevronLeft, 
  FaChevronRight, FaTimes, FaRedo, FaInfoCircle, FaSearch,
  FaCheckCircle, FaExclamationCircle, FaUserCheck, FaClock, FaRunning
} from 'react-icons/fa';
import UploadCard from '../components/Cards/UploadCard';
import PageHeader from '../components/ui/PageHeader';
import PremiumButton from '../components/ui/PremiumButton';
import { 
  uploadVideo, 
  startVideoAnalysis, 
  getVideoStatus, 
  getVideoResults, 
  deleteVideo,
  getVideoFrameUrl 
} from '../services/api';

const VideoDetection = () => {
  // File & Upload state
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('idle');
  const [processedFrames, setProcessedFrames] = useState(0);
  const [sampledFrames, setSampledFrames] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [videoId, setVideoId] = useState(null);

  // Result state
  const [resultReady, setResultReady] = useState(false);
  const [results, setResults] = useState(null);
  const [activeDetection, setActiveDetection] = useState(null);
  const [activeSegment, setActiveSegment] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Config variables
  const [analysisFps, setAnalysisFps] = useState(3.0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(52.0);
  const [windowSize, setWindowSize] = useState(3);
  const [transitionThreshold, setTransitionThreshold] = useState(2);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const pollingRef = useRef(null);

  // Handle file select & extract local metadata
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) {
      handleCancel();
      return;
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    // File validation
    if (!allowedTypes.includes(selectedFile.type) && !['.avi', '.mov', '.mp4', '.webm'].includes(fileExt)) {
      setError("Unsupported format. Please upload MP4, MOV, AVI, or WebM.");
      setFile(null);
      setVideoPreviewUrl(null);
      setMetadata(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB. Please upload a smaller video clip.");
      setFile(null);
      setVideoPreviewUrl(null);
      setMetadata(null);
      return;
    }

    setError(null);
    setFile(selectedFile);

    const localUrl = URL.createObjectURL(selectedFile);
    setVideoPreviewUrl(localUrl);

    // Extract duration & resolution
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = localUrl;
    tempVideo.onloadedmetadata = () => {
      setMetadata({
        filename: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        duration: tempVideo.duration.toFixed(1) + 's',
        resolution: `${tempVideo.videoWidth}x${tempVideo.videoHeight}`
      });
    };
  };

  const handleCancel = () => {
    if (videoId) {
      deleteVideo(videoId).catch(console.error);
    }
    // Cleanup URLs and state
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    
    setFile(null);
    setVideoPreviewUrl(null);
    setMetadata(null);
    setError(null);
    setVideoId(null);
    setProcessing(false);
    setResultReady(false);
    setResults(null);
    setActiveDetection(null);
    setActiveSegment(null);
    setProgress(0);
    setStage('idle');
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  // Start analysis pipeline
  const handleStartAnalysis = async () => {
    if (!file) return;

    setProcessing(true);
    setStage('Uploading');
    setProgress(5);
    setElapsedTime(0);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // 1. Upload file
      const uploadRes = await uploadVideo(file);
      if (!uploadRes.success || !uploadRes.data?.videoId) {
        throw new Error(uploadRes.error || "Failed to upload video.");
      }

      const vidId = uploadRes.data.videoId;
      setVideoId(vidId);
      setStage('Preparing Video');
      setProgress(10);

      // 2. Start background process
      const startRes = await startVideoAnalysis(vidId, {
        analysisFps,
        confidenceThreshold,
        windowSize,
        transitionThreshold
      });

      if (!startRes.success) {
        throw new Error(startRes.message || "Failed to launch analysis task.");
      }

      // 3. Polling loop
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await getVideoStatus(vidId);
          if (statusRes.success) {
            const data = statusRes.data;
            setProgress(data.progress);
            setStage(data.stage);
            setProcessedFrames(data.processedFrames);
            setSampledFrames(data.sampledFrames);

            if (data.status === 'completed') {
              clearInterval(pollingRef.current);
              clearInterval(timerRef.current);
              // Fetch final results
              const resultsRes = await getVideoResults(vidId);
              if (resultsRes.success) {
                setResults(resultsRes.data);
                if (resultsRes.data.detections?.length > 0) {
                  setActiveDetection(resultsRes.data.detections[0]);
                }
                if (resultsRes.data.segments?.length > 0) {
                  setActiveSegment(resultsRes.data.segments[0]);
                }
                setResultReady(true);
                setProcessing(false);
              } else {
                throw new Error(resultsRes.error || "Failed to fetch results.");
              }
            } else if (data.status === 'failed') {
              clearInterval(pollingRef.current);
              clearInterval(timerRef.current);
              setError(data.error || "Model analysis failed.");
              setProcessing(false);
            }
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 900);

    } catch (err) {
      console.error("Analysis Pipeline failed:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setProcessing(false);
      clearInterval(timerRef.current);
      clearInterval(pollingRef.current);
    }
  };

  // Synchronize play state
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  // Track video time update and select appropriate detection segment
  const handleTimeUpdate = () => {
    if (!videoRef.current || !results) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Find the closest detection
    if (results.detections && results.detections.length > 0) {
      let closest = results.detections[0];
      let minDiff = Math.abs(closest.timestamp - time);

      for (let i = 1; i < results.detections.length; i++) {
        const diff = Math.abs(results.detections[i].timestamp - time);
        if (diff < minDiff) {
          minDiff = diff;
          closest = results.detections[i];
        }
      }
      // Select the detection if within frame bounds (e.g. 0.8 seconds distance)
      if (minDiff < 0.8) {
        setActiveDetection(closest);
      }
    }

    // Find active timeline segment
    if (results.segments) {
      const activeSeg = results.segments.find(s => time >= s.startTime && time <= s.endTime);
      if (activeSeg) {
        setActiveSegment(activeSeg);
      }
    }
  };

  // Navigation handlers
  const handlePrevPose = () => {
    if (!results || !activeDetection) return;
    const idx = results.detections.findIndex(d => d.frameNumber === activeDetection.frameNumber);
    if (idx > 0) {
      const prevDet = results.detections[idx - 1];
      seekTo(prevDet.timestamp);
      setActiveDetection(prevDet);
    }
  };

  const handleNextPose = () => {
    if (!results || !activeDetection) return;
    const idx = results.detections.findIndex(d => d.frameNumber === activeDetection.frameNumber);
    if (idx !== -1 && idx < results.detections.length - 1) {
      const nextDet = results.detections[idx + 1];
      seekTo(nextDet.timestamp);
      setActiveDetection(nextDet);
    }
  };

  const jumpToIncorrectOrUncertain = () => {
    if (!results) return;
    const targets = results.detections.filter(d => d.status === 'Incorrect' || d.status === 'Uncertain');
    if (targets.length === 0) return;

    // Find the next incorrect/uncertain moment after current time
    const nextTarget = targets.find(t => t.timestamp > currentTime + 0.1) || targets[0];
    seekTo(nextTarget.timestamp);
    setActiveDetection(nextTarget);
  };

  // Download PDF Report helper
  const handleDownloadReport = () => {
    if (!results) return;
    
    // Generate text report
    let report = `MALLAKHAMB POSE DETECTION ANALYSIS REPORT\n`;
    report += `Filename: ${results.filename}\n`;
    report += `Duration: ${results.duration}s | FPS: ${results.fps}\n`;
    report += `Frames Processed: ${results.sampledFrames}/${results.totalFrames}\n`;
    report += `Average Confidence: ${results.averageConfidence}%\n`;
    report += `Processing Duration: ${results.processingTime}s\n\n`;
    report += `DETAILED TIMELINE SEGMENTS:\n`;
    
    results.segments.forEach(seg => {
      report += `[${seg.startTime.toFixed(1)}s - ${seg.endTime.toFixed(1)}s] ${seg.pose} (Dur: ${seg.duration}s, Avg Conf: ${seg.averageConfidence}%)\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Mallakhamb_Analysis_${results.filename.replace(/\.[^/.]+$/, "")}.txt`;
    link.click();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="page-wrapper pt-0 mt-0">
      <Container className="position-relative">
        <PageHeader
          label="COMPREHENSIVE VIDEO INTELLIGENCE"
          title="Video Pose"
          highlight="Analysis"
          subtitle="Upload dynamic training videos for frame sampling, temporal pose stabilization, correctness scoring, and detailed body-joint feedback."
        />

        {error && (
          <div className="alert alert-danger rounded-4 p-3 mb-4 d-flex align-items-center gap-3 border-0" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#F87171' }}>
            <FaExclamationCircle style={{ fontSize: '1.25rem' }} />
            <div className="flex-grow-1">{error}</div>
            <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => setError(null)}><FaTimes /></button>
          </div>
        )}

        <Row className="g-4">
          {/* LEFT COLUMN: Upload & Preview / Processing Status */}
          {!resultReady && (
            <Col lg={8} className="mx-auto">
              {!processing ? (
                <div>
                  <UploadCard
                    fileType="Video"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    onFileSelect={handleFileSelect}
                  />

                  {/* Config & Meta Previews */}
                  {file && metadata && (
                    <div className="glass-card p-4 mt-4">
                      <h5 className="font-display gradient-text mb-3">Video Upload Specs</h5>
                      <Row className="g-3 mb-4 text-center">
                        {[
                          { label: 'Filename', value: metadata.filename },
                          { label: 'File Size', value: metadata.size },
                          { label: 'Duration', value: metadata.duration },
                          { label: 'Resolution', value: metadata.resolution }
                        ].map((item, idx) => (
                          <Col xs={6} md={3} key={idx}>
                            <div className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.label}</div>
                              <div className="text-truncate fw-bold" style={{ fontSize: '0.85rem' }} title={item.value}>{item.value}</div>
                            </div>
                          </Col>
                        ))}
                      </Row>

                      {/* Config panel */}
                      <h5 className="font-display gradient-text mb-3">Analysis Settings</h5>
                      <Row className="g-3 mb-4">
                        <Col sm={6} md={3}>
                          <label className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Target Sampling FPS</label>
                          <select className="form-select bg-dark text-white border-secondary" style={{ fontSize: '0.85rem' }} value={analysisFps} onChange={(e) => setAnalysisFps(parseFloat(e.target.value))}>
                            <option value="1.0">1.0 FPS (Fastest)</option>
                            <option value="2.0">2.0 FPS</option>
                            <option value="3.0">3.0 FPS (Recommended)</option>
                            <option value="5.0">5.0 FPS (Highly Detailed)</option>
                          </select>
                        </Col>
                        <Col sm={6} md={3}>
                          <label className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Confidence Threshold</label>
                          <input type="number" className="form-control bg-dark text-white border-secondary" style={{ fontSize: '0.85rem' }} min="10" max="95" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))} />
                        </Col>
                        <Col sm={6} md={3}>
                          <label className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Smoothing Window</label>
                          <select className="form-select bg-dark text-white border-secondary" style={{ fontSize: '0.85rem' }} value={windowSize} onChange={(e) => setWindowSize(parseInt(e.target.value))}>
                            <option value="1">No Smoothing (1 Frame)</option>
                            <option value="3">Moderate (3 Frames)</option>
                            <option value="5">Strong (5 Frames)</option>
                          </select>
                        </Col>
                        <Col sm={6} md={3}>
                          <label className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Transition Threshold</label>
                          <select className="form-select bg-dark text-white border-secondary" style={{ fontSize: '0.85rem' }} value={transitionThreshold} onChange={(e) => setTransitionThreshold(parseInt(e.target.value))}>
                            <option value="1">Instant (1 Match)</option>
                            <option value="2">Steady (2 Matches)</option>
                            <option value="3">Secure (3 Matches)</option>
                          </select>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-between gap-3">
                        <PremiumButton onClick={handleCancel} variant="outline">
                          Cancel &amp; Replace
                        </PremiumButton>
                        <PremiumButton onClick={handleStartAnalysis}>
                          <FaRunning /> Begin AI Analysis
                        </PremiumButton>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* LIVE PROCESSING OVERLAY */
                <div className="glass-card p-4 p-md-5 text-center">
                  <h4 className="font-display gradient-text mb-4 d-flex justify-content-center align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
                    Analyzing Mallakhamb Video Sequence...
                  </h4>

                  {/* Horizontal visual progress bars */}
                  <div className="mb-4">
                    <ProgressBar now={progress} label={`${progress}%`} className="rounded-5" style={{ height: 24, background: 'rgba(255,255,255,0.04)' }} variant="warning" animated />
                  </div>

                  <Row className="g-3 mb-5">
                    {[
                      { label: 'Active Pipeline Stage', value: stage, accent: true },
                      { label: 'Sampled Frames Processed', value: `${processedFrames} / ${sampledFrames || '...'}` },
                      { label: 'Elapsed Duration', value: `${elapsedTime}s` }
                    ].map((s, i) => (
                      <Col md={4} key={i}>
                        <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                          <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>{s.label}</div>
                          <div className="fw-bold" style={{ fontSize: '1.25rem', color: s.accent ? 'var(--primary)' : '#fff' }}>{s.value}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <div className="mb-3 text-start bg-dark p-3 rounded-3" style={{ border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <div className="fw-bold text-muted mb-2 uppercase">Processing Stages:</div>
                    <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0">
                      {[
                        { name: 'Uploading', order: 10 },
                        { name: 'Preparing Video', order: 20 },
                        { name: 'Extracting Frames', order: 30 },
                        { name: 'Detecting Poses', order: 90 },
                        { name: 'Generating Results', order: 98 },
                        { name: 'Completed', order: 100 }
                      ].map((step, idx) => {
                        const isDone = progress >= step.order || stage === step.name;
                        const isActive = stage === step.name;
                        return (
                          <li key={idx} className="d-flex align-items-center gap-1">
                            <span className={`badge rounded-circle ${isDone ? 'bg-success' : 'bg-secondary'}`} style={{ width: 8, height: 8, padding: 0 }}></span>
                            <span style={{ color: isActive ? 'var(--primary)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <PremiumButton onClick={handleCancel} variant="outline" className="mt-3">
                    <FaTimes /> Cancel Analysis Task
                  </PremiumButton>
                </div>
              )}
            </Col>
          )}

          {/* DYNAMIC RESULTS DASHBOARD */}
          {resultReady && results && (
            <Col lg={12}>
              <div className="glass-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="font-display gradient-text mb-1">Mallakhamb Performance Insights</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Analyzed: {results.filename}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <PremiumButton variant="outline" onClick={handleCancel}>
                      <FaRedo /> New Analysis
                    </PremiumButton>
                    <PremiumButton onClick={handleDownloadReport}>
                      <FaDownload /> Download Report
                    </PremiumButton>
                  </div>
                </div>

                <Row className="g-4">
                  {/* LEFT: Video Player and Controls */}
                  <Col lg={7}>
                    <div className="position-relative rounded-4 overflow-hidden mb-3 bg-black" style={{ border: '1px solid var(--border)', aspectRatio: '16/9' }}>
                      <video
                        ref={videoRef}
                        src={videoPreviewUrl}
                        className="w-100 h-100"
                        onTimeUpdate={handleTimeUpdate}
                        onClick={togglePlay}
                      />
                      {/* Big Floating Play Button Overlay when paused */}
                      {!isPlaying && (
                        <div 
                          className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 60, height: 60, background: 'rgba(255, 94, 0, 0.8)', color: '#fff', cursor: 'pointer', zIndex: 10 }}
                          onClick={togglePlay}
                        >
                          <FaPlay style={{ marginLeft: 4 }} />
                        </div>
                      )}
                    </div>

                    {/* Navigation Bar controls */}
                    <div className="glass-card p-3 d-flex align-items-center justify-content-between gap-3 mb-4">
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light rounded-circle" style={{ width: 40, height: 40, padding: 0 }} onClick={togglePlay}>
                          {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <button className="btn btn-outline-light" onClick={() => seekTo(0)}>
                          <FaRedo style={{ fontSize: '0.8rem' }} /> Restart
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-light btn-sm" title="Previous Pose Frame" onClick={handlePrevPose}>
                          <FaChevronLeft /> Prev Pose
                        </button>
                        <span className="font-display px-2 text-warning" style={{ fontSize: '0.9rem', minWidth: 60, textAlign: 'center' }}>
                          {currentTime.toFixed(1)}s / {results.duration}s
                        </span>
                        <button className="btn btn-outline-light btn-sm" title="Next Pose Frame" onClick={handleNextPose}>
                          Next Pose <FaChevronRight />
                        </button>
                      </div>

                      <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={jumpToIncorrectOrUncertain}>
                        <FaExclamationTriangle /> Jump to Issue
                      </button>
                    </div>

                    {/* Timeline Block */}
                    <h5 className="font-display d-flex align-items-center gap-2 mb-3">
                      <FaChartLine style={{ color: 'var(--primary)' }} /> Visual Pose Timeline
                    </h5>
                    
                    <div className="position-relative p-2 rounded-4 mb-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}>
                      {/* Playhead indicator bar */}
                      <div 
                        className="position-absolute top-0 bottom-0 bg-warning" 
                        style={{ 
                          width: 3, 
                          left: `${(currentTime / results.duration) * 100}%`, 
                          zIndex: 10,
                          transition: 'left 0.1s linear',
                          pointerEvents: 'none'
                        }}
                      />
                      
                      {/* Segment Blocks */}
                      <div className="d-flex overflow-hidden rounded-3" style={{ height: 40, cursor: 'pointer' }}>
                        {results.segments && results.segments.map((seg, idx) => {
                          const pct = (seg.duration / results.duration) * 100;
                          
                          // Determine color based on status/pose
                          let bg = 'rgba(148, 163, 184, 0.4)'; // Default gray (Unrecognized)
                          if (seg.pose !== 'Uncertain / Unknown Pose') {
                            if (seg.averageConfidence >= 80) {
                              bg = 'rgba(16, 185, 129, 0.7)'; // Stable correct pose (green)
                            } else if (seg.averageConfidence >= 65) {
                              bg = 'rgba(245, 158, 11, 0.75)'; // Medium confidence (orange)
                            } else {
                              bg = 'rgba(239, 68, 68, 0.7)'; // Low confidence / incorrect (red)
                            }
                          }
                          
                          const isActive = activeSegment && activeSegment.startTime === seg.startTime;

                          return (
                            <div
                              key={idx}
                              style={{ 
                                width: `${pct}%`, 
                                background: bg, 
                                borderRight: '1px solid rgba(0,0,0,0.2)',
                                border: isActive ? '2px solid #FFD700' : 'none',
                                position: 'relative'
                              }}
                              onClick={() => seekTo(seg.startTime)}
                              title={`${seg.pose}: ${seg.startTime.toFixed(1)}s - ${seg.endTime.toFixed(1)}s (Confidence: ${seg.averageConfidence}%)`}
                            />
                          );
                        })}
                      </div>

                      {/* Time indicators */}
                      <div className="d-flex justify-content-between mt-2 px-1 text-muted" style={{ fontSize: '0.7rem' }}>
                        <span>0:00</span>
                        <span>{(results.duration * 0.25).toFixed(1)}s</span>
                        <span>{(results.duration * 0.5).toFixed(1)}s</span>
                        <span>{(results.duration * 0.75).toFixed(1)}s</span>
                        <span>{results.duration.toFixed(1)}s</span>
                      </div>
                    </div>

                    {/* Timeline List of Poses */}
                    <div className="p-3 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', maxHeight: 220, overflowY: 'auto' }}>
                      <div className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Pose Log:</div>
                      {results.segments && results.segments.map((seg, idx) => {
                        const isActive = activeSegment && activeSegment.startTime === seg.startTime;
                        return (
                          <div 
                            key={idx} 
                            className={`d-flex align-items-center justify-content-between p-2 mb-1 rounded-3 ${isActive ? 'bg-elevated' : ''}`}
                            style={{ cursor: 'pointer', border: isActive ? '1px solid var(--primary-light)' : '1px solid transparent', fontSize: '0.8rem' }}
                            onClick={() => seekTo(seg.startTime)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-dark text-warning">
                                {seg.startTime.toFixed(1)}s
                              </span>
                              <span className={isActive ? 'fw-bold text-white' : 'text-secondary'}>
                                {seg.pose}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted">Dur: {seg.duration.toFixed(1)}s</span>
                              <span className="fw-bold" style={{ color: seg.averageConfidence > 75 ? '#10B981' : '#F59E0B' }}>
                                {seg.averageConfidence}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Col>

                  {/* RIGHT: Stats Grid & Pose Details */}
                  <Col lg={5}>
                    {/* Stat Grid */}
                    <Row className="g-2 mb-3 text-center">
                      {[
                        { label: 'Video Duration', value: `${results.duration}s`, icon: <FaClock className="text-info" /> },
                        { label: 'Sampled Frames', value: results.sampledFrames, icon: <FaFileVideo className="text-primary" /> },
                        { label: 'Unique Poses', value: [...new Set(results.detections.filter(d => d.pose !== 'Uncertain / Unknown Pose').map(d => d.pose))].length, icon: <FaRunning className="text-warning" /> },
                        { label: 'Avg Confidence', value: `${results.averageConfidence}%`, icon: <FaTrophy className="text-success" /> }
                      ].map((item, idx) => (
                        <Col xs={6} key={idx}>
                          <div className="p-2 rounded-4 d-flex align-items-center gap-3 text-start" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                            <div className="p-2 rounded-3 bg-dark">{item.icon}</div>
                            <div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{item.label}</div>
                              <div className="fw-bold" style={{ fontSize: '1rem' }}>{item.value}</div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    {/* Detected Pose Details Card */}
                    {activeDetection ? (
                      <Card className="glass-card mb-3" style={{ border: '1px solid var(--border)' }}>
                        <Card.Header className="bg-transparent border-bottom-0 pb-0 pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge-accent">Frame {activeDetection.frameNumber}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Timestamp: {activeDetection.timestamp.toFixed(1)}s</span>
                          </div>
                        </Card.Header>
                        <Card.Body className="pt-2">
                          <h4 className="font-display text-warning mb-3">{activeDetection.pose}</h4>

                          <Row className="g-3 align-items-center mb-3">
                            <Col xs={6}>
                              <div className="p-2 rounded-3 text-center bg-dark">
                                <div className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>AI Confidence</div>
                                <h5 className="fw-bold text-info mb-0">{activeDetection.confidence.toFixed(1)}%</h5>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className="p-2 rounded-3 text-center bg-dark">
                                <div className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Joint Accuracy</div>
                                <h5 className="fw-bold text-success mb-0">{activeDetection.accuracy.toFixed(1)}%</h5>
                              </div>
                            </Col>
                          </Row>

                          {/* Correctness banner */}
                          <div 
                            className="p-2 rounded-3 d-flex align-items-center gap-2 mb-3 fw-bold" 
                            style={{ 
                              background: activeDetection.status === 'Correct' ? 'rgba(16, 185, 129, 0.15)' : activeDetection.status === 'Incorrect' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: activeDetection.status === 'Correct' ? '#34D399' : activeDetection.status === 'Incorrect' ? '#F87171' : '#FBBF24',
                              fontSize: '0.85rem'
                            }}
                          >
                            {activeDetection.status === 'Correct' ? (
                              <><FaCheckCircle /> Correct Mallakhamb Posture Grade: {activeDetection.grade}</>
                            ) : activeDetection.status === 'Incorrect' ? (
                              <><FaExclamationTriangle /> Form Errors Detected | Grade: {activeDetection.grade}</>
                            ) : (
                              <><FaInfoCircle /> Transition / Uncertain Pose</>
                            )}
                          </div>

                          {/* Incorrect body regions if present */}
                          {activeDetection.incorrectRegions && activeDetection.incorrectRegions.length > 0 && (
                            <div className="mb-3">
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Incorrect Regions: </span>
                              {activeDetection.incorrectRegions.map((reg, idx) => (
                                <span key={idx} className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-30 me-1" style={{ fontSize: '0.7rem' }}>
                                  {reg}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Live Frame Image Render */}
                          <div 
                            className="rounded-4 overflow-hidden mb-3 bg-black position-relative" 
                            style={{ border: '1px solid var(--border)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <img
                              src={getVideoFrameUrl(videoId, activeDetection.frameNumber)}
                              alt="Annotated Frame"
                              className="h-100 w-auto"
                              style={{ objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-1 text-center" style={{ fontSize: '0.7rem', color: '#999' }}>
                              Annotated Skeleton Frame Overlay
                            </div>
                          </div>

                          {/* Coach feedback */}
                          <div className="bg-dark p-3 rounded-4" style={{ border: '1px solid var(--border)' }}>
                            <div className="fw-bold text-muted mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                              <FaUserCheck className="text-warning" /> Coach Alignment Feedback:
                            </div>
                            <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
                              {activeDetection.feedback && activeDetection.feedback.map((tip, idx) => (
                                <li key={idx} className="mb-1">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <div className="glass-card p-4 text-center text-muted">
                        Select a frame or play the video to see pose details.
                      </div>
                    )}

                    {/* Form Issues & Anomalies Sidebar Quick Jumps */}
                    <div className="glass-card p-3">
                      <h6 className="font-display d-flex align-items-center gap-2 mb-2 text-danger">
                        <FaExclamationTriangle /> Form Correction Alerts
                      </h6>
                      <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>Jump directly to frames where posture correction is needed:</p>
                      
                      <div className="overflow-auto" style={{ maxHeight: 150 }}>
                        {results.detections && results.detections.filter(d => d.status === 'Incorrect' || d.status === 'Uncertain').length > 0 ? (
                          results.detections
                            .filter(d => d.status === 'Incorrect' || d.status === 'Uncertain')
                            .map((issue, idx) => (
                              <div
                                key={idx}
                                className="d-flex align-items-center justify-content-between p-2 mb-1 rounded-3 bg-dark bg-opacity-50 hover-glow"
                                style={{ cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem' }}
                                onClick={() => seekTo(issue.timestamp)}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-danger bg-opacity-20 text-danger">{issue.timestamp.toFixed(1)}s</span>
                                  <span className="fw-bold text-white">{issue.pose}</span>
                                </div>
                                <span className="text-warning fw-bold">{issue.status}</span>
                              </div>
                            ))
                        ) : (
                          <div className="text-success text-center p-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
                            🎉 Great work! No major form corrections detected.
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default VideoDetection;
