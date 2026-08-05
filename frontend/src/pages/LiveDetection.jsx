import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaVideoSlash, FaBolt, FaCrosshairs, FaCommentDots, FaVolumeUp, FaHeartbeat, FaShieldAlt } from 'react-icons/fa';
import WebcamCard from '../components/Cards/WebcamCard';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import { predictFrame } from '../services/api';
import { PageTransition, FadeUp } from '../components/animations/MotionWrappers';

const LiveDetection = () => {
  const [status, setStatus] = useState('idle');
  const [fps, setFps] = useState(0);
  const [detectionData, setDetectionData] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const lastSpokenRef = useRef({ pose: '', time: 0 });
  const frameCountRef = useRef(0);

  useEffect(() => {
    let fpsInterval;
    if (status === 'active') {
      fpsInterval = setInterval(() => {
        setFps(frameCountRef.current * 4);
        frameCountRef.current = 0;
      }, 1000);
    } else {
      setFps(0);
      setDetectionData(null);
    }
    return () => {
      if (fpsInterval) clearInterval(fpsInterval);
    };
  }, [status]);

  const speakFeedback = (poseName, accuracy, feedbackList) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    const now = Date.now();
    if (poseName !== lastSpokenRef.current.pose || (now - lastSpokenRef.current.time) > 15000) {
      window.speechSynthesis.cancel();
      let text = `Pose detected: ${poseName}. Accuracy: ${accuracy} percent. `;
      if (feedbackList && feedbackList.length > 0) {
        text += feedbackList.slice(0, 2).join(". ");
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);

      lastSpokenRef.current = { pose: poseName, time: now };
    }
  };

  const handleFrameResult = useCallback(async (frameBase64) => {
    frameCountRef.current += 1;
    const response = await predictFrame(frameBase64);
    if (response && response.data) {
      setDetectionData(response.data);
      if (response.success && response.data.poseName && response.data.poseName !== "No Pose Detected") {
        speakFeedback(
          response.data.poseName, 
          response.data.accuracy, 
          response.data.corrections || response.data.feedback
        );
      }
    }
    return response;
  }, [audioEnabled]);

  const stats = [
    { 
      icon: FaBolt, 
      label: 'Stream Status', 
      value: status === 'active' ? 'LIVE' : status === 'paused' ? 'PAUSED' : 'OFFLINE', 
      highlight: status === 'active', 
      pulse: status === 'active' 
    },
    { icon: FaHeartbeat, label: 'Performance FPS', value: fps ? `${fps} FPS` : '--' },
    { 
      icon: FaCrosshairs, 
      label: 'Current Pose', 
      value: detectionData?.poseName || (status === 'active' ? 'Detecting...' : '--'), 
      accent: true 
    },
    { 
      icon: FaShieldAlt, 
      label: 'Accuracy Score', 
      value: detectionData?.accuracy ? `${detectionData.accuracy}% (${detectionData.grade})` : '--%' 
    },
  ];

  return (
    <PageTransition>
      <div className="page-wrapper">
        <Container className="position-relative">
          <PageHeader
            label="REAL-TIME VISION"
            title="Live Pose"
            highlight="Analytics"
            subtitle="Real-time MediaPipe AI posture tracking, joint alignment evaluation, and instant coach audio feedback."
          />

          <Row className="g-3 g-lg-4">
            <Col lg={8}>
              <FadeUp delay={0.05}>
                <WebcamCard 
                  onStatusChange={setStatus} 
                  onFrameResult={handleFrameResult} 
                />
              </FadeUp>
            </Col>
            <Col lg={4}>
              <FadeUp delay={0.1} className="h-100">
                <GlassCard hover={false} padding="p-4" className="h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 className="font-display gradient-text mb-0" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      Sports Dashboard
                    </h4>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                      style={{ 
                        fontSize: '0.8rem', 
                        background: audioEnabled ? 'rgba(255,94,0,0.15)' : 'rgba(255,255,255,0.05)',
                        color: audioEnabled ? '#FF5E00' : '#9CA3AF',
                        border: '1px solid ' + (audioEnabled ? 'rgba(255,94,0,0.3)' : 'rgba(255,255,255,0.1)')
                      }}
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      title="Toggle Voice Feedback"
                    >
                      <FaVolumeUp /> {audioEnabled ? 'Voice ON' : 'Mute'}
                    </button>
                  </div>

                  {status === 'idle' ? (
                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted-custom py-4">
                      <FaVideoSlash style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.85rem', maxWidth: 240, textAlign: 'center' }}>
                        Start live camera stream to view real-time posture analytics
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {stats.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="stat-row d-flex justify-content-between align-items-center"
                        >
                          <span className="text-muted-custom d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                            <item.icon style={{ color: '#FF5E00', fontSize: '0.8rem' }} />
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: item.accent ? '#00F2FE' : item.highlight ? '#10B981' : '#FFFFFF',
                            }}
                            className={item.pulse ? 'badge-live' : ''}
                          >
                            {item.value}
                          </span>
                        </motion.div>
                      ))}

                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <h6 className="font-display d-flex align-items-center gap-2 mb-2 text-white" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          <FaCommentDots style={{ color: '#F59E0B' }} /> Real-time Coach Tips
                        </h6>
                        <div className="stat-row text-secondary-custom" style={{ fontSize: '0.85rem', minHeight: 80, lineHeight: 1.6 }}>
                          {detectionData?.corrections ? (
                            <ul className="ps-3 mb-0">
                              {detectionData.corrections.map((tip, i) => (
                                <li key={i} style={{ color: tip.includes('Perfect') ? '#10B981' : '#F3F4F6' }}>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Position yourself in frame with full body and pole visible."
                          )}
                        </div>
                      </div>

                      {status === 'active' && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="stat-label" style={{ fontSize: '0.75rem' }}>AI Model Confidence</span>
                            <span style={{ color: '#FF5E00', fontWeight: 700 }}>{detectionData?.confidence || 0}%</span>
                          </div>
                          <div className="confidence-meter">
                            <motion.div
                              className="confidence-meter-fill"
                              animate={{ width: `${detectionData?.confidence || 0}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>
              </FadeUp>
            </Col>
          </Row>
        </Container>
      </div>
    </PageTransition>
  );
};

export default LiveDetection;
