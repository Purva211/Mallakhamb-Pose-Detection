import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaStop, FaPause, FaCamera, FaCircle } from 'react-icons/fa';
import PremiumButton from '../ui/PremiumButton';

const WebcamCard = ({ onStatusChange, onFrameResult }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const isProcessingRef = useRef(false);

  const onFrameResultRef = useRef(onFrameResult);
  useEffect(() => {
    onFrameResultRef.current = onFrameResult;
  }, [onFrameResult]);

  // Attach stream to video element when active and mounted
  useEffect(() => {
    if (isActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.log('Video play error:', e));
    }
  }, [isActive, stream]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setWebcamError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      setIsActive(true);
      setIsPaused(false);
      onStatusChange?.('active');
    } catch (err) {
      console.error('Error accessing webcam:', err);
      let errorMsg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg += 'Please grant camera permissions in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg += 'No camera device was found on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg += 'Camera is currently in use by another application (e.g. Zoom, Teams, or OpenCV).';
      } else {
        errorMsg += err.message || '';
      }
      setWebcamError(errorMsg);
      onStatusChange?.('error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsPaused(false);
    setAnnotatedFrame(null);
    onStatusChange?.('idle');
  };

  const togglePause = () => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPaused(!isPaused);
    onStatusChange?.(isPaused ? 'active' : 'paused');
  };

  // Real-time Frame Capture Loop
  useEffect(() => {
    let intervalId;
    if (isActive && !isPaused) {
      const captureAndSendFrame = async () => {
        if (!videoRef.current || isProcessingRef.current) return;
        const video = videoRef.current;
        if (video.readyState < 2) return;

        isProcessingRef.current = true;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const frameBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          if (onFrameResultRef.current) {
            const res = await onFrameResultRef.current(frameBase64);
            if (res && res.data && res.data.image) {
              setAnnotatedFrame(res.data.image);
            }
          }
        } catch (err) {
          console.error('Error processing live frame:', err);
        } finally {
          isProcessingRef.current = false;
        }
      };

      intervalId = setInterval(captureAndSendFrame, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, isPaused]);

  return (
    <div className="glass-card p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 rounded-circle" style={{ background: 'rgba(255, 94, 0, 0.15)', color: '#FF5E00' }}>
            <FaCamera size={16} />
          </div>
          <div>
            <h4 className="mb-0 font-display fw-bold" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
              Live Camera Feed
            </h4>
            <small className="text-muted-custom">Real-time MediaPipe AI Posture Vision</small>
          </div>
        </div>
        {isActive && (
          <span className="badge-live d-flex align-items-center gap-2">
            <FaCircle size={8} style={{ color: '#10B981', animation: 'pulse 1.5s infinite' }} /> LIVE AI
          </span>
        )}
      </div>

      <div
        className="position-relative rounded-4 overflow-hidden flex-grow-1 mb-3 shadow-lg d-flex align-items-center justify-content-center"
        style={{
          width: '100%',
          minHeight: 420,
          background: '#05070E',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {!isActive ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-3 p-4 rounded-circle"
              style={{ background: 'rgba(255, 94, 0, 0.08)', border: '1px dashed rgba(255, 94, 0, 0.3)' }}
            >
              <FaCamera style={{ fontSize: '2.5rem', color: '#FF5E00', opacity: 0.8 }} />
            </motion.div>
            <h5 className="font-display fw-bold text-white mb-2">Camera Inactive</h5>
            
            {webcamError ? (
              <div className="alert alert-danger mx-auto mb-4" style={{ maxWidth: 400, fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}>
                {webcamError}
              </div>
            ) : (
              <p className="text-muted-custom mb-4" style={{ maxWidth: 360, fontSize: '0.85rem' }}>
                Click <strong>Start Camera</strong> to launch real-time posture analysis &amp; skeleton tracking.
              </p>
            )}
            
            <PremiumButton onClick={startCamera}>
              <FaPlay size={12} /> {webcamError ? 'Retry Camera' : 'Start Camera'}
            </PremiumButton>
          </div>
        ) : (
          <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center" style={{ minHeight: 420 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%',
                height: '100%',
                minHeight: 420,
                objectFit: 'cover', 
                transform: 'scaleX(-1)',
                display: 'block'
              }}
            />

            {annotatedFrame && (
              <img
                src={annotatedFrame}
                alt="AI Skeleton Overlay"
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>
        )}
      </div>

      {isActive && (
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <PremiumButton variant="outline" onClick={togglePause}>
            {isPaused ? <><FaPlay size={12} /> Resume Stream</> : <><FaPause size={12} /> Pause Stream</>}
          </PremiumButton>
          <button
            type="button"
            className="btn-outline-premium d-flex align-items-center gap-2"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)' }}
            onClick={stopCamera}
          >
            <FaStop size={12} /> Stop Stream
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamCard;
