import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaImage, FaChartLine, FaHistory, FaCheckCircle,
  FaArrowRight, FaPlay, FaBullseye, FaBrain, FaRocket, FaReact, FaPython, FaDumbbell, FaLeaf, FaUpload, FaSearch, FaAward, FaFileAlt
} from 'react-icons/fa';
import FeatureCard from '../components/Cards/FeatureCard';
import PremiumButton from '../components/ui/PremiumButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { FadeUp, StaggerContainer, StaggerItem, HeroReveal, SlideLeft, SlideRight } from '../components/animations/MotionWrappers';

const Home = () => {

  const features = [
    { icon: FaCamera, title: 'Live Camera Detection', description: 'Real-time pose estimation using webcam with instant feedback and correction overlays.', color: '#FF5E00' },
    { icon: FaVideo, title: 'Video Analysis', description: 'Upload recorded videos for comprehensive frame-by-frame pose analysis and scoring.', color: '#00F2FE' },
    { icon: FaImage, title: 'Image Processing', description: 'Analyze static images of Mallakhamb poses with high accuracy and detailed reports.', color: '#F59E0B' },
    { icon: FaChartLine, title: 'Pose Accuracy', description: 'Get precise percentage scores comparing your pose against professional benchmarks.', color: '#FF5E00' },
    { icon: FaCheckCircle, title: 'Pose Correction', description: 'Receive actionable textual feedback on how to improve posture and alignment.', color: '#10B981' },
    { icon: FaHistory, title: 'History & Tracking', description: 'Monitor progress over time with detailed dashboards and performance analytics.', color: '#00F2FE' },
  ];

  const workflowSteps = [
    { num: '01', icon: FaUpload, title: 'Upload Media', desc: 'Select photo or start live camera stream' },
    { num: '02', icon: FaSearch, title: 'Detect Pole', desc: 'YOLO auto-zooms & locates performer' },
    { num: '03', icon: FaBullseye, title: 'Estimate Pose', desc: 'MediaPipe extracts 33 body landmarks' },
    { num: '04', icon: FaAward, title: 'Analyze Accuracy', desc: 'Classifier scores 3D joint angles' },
    { num: '05', icon: FaFileAlt, title: 'Generate Feedback', desc: 'Receive grade & correction guidance' },
  ];

  const cards = [
    { icon: FaBullseye, title: 'Project Objective', text: 'Automated AI system for recognizing and scoring Mallakhamb postures to assist judges, coaches, and athletes in training.', color: '#FF5E00' },
    { icon: FaBrain, title: 'MediaPipe AI Vision', text: 'Powered by MediaPipe 33-landmark pose estimation, computer vision, and machine learning classifiers operating in real-time.', color: '#00F2FE' },
    { icon: FaRocket, title: 'Future Expansion', text: 'Expanding to Rope & Hanging Mallakhamb, 3D trajectory tracking, and comparative national athlete performance indexing.', color: '#F59E0B' },
  ];

  const typesCards = [
    { icon: FaHistory, title: 'Pole Mallakhamb', text: 'A vertical teak pole fixed firmly in the ground, coated with castor oil to minimize friction during acrobatic mounts.' },
    { icon: FaLeaf, title: 'Hanging Mallakhamb', text: 'A shorter wooden pole suspended with hooks and chains, testing equilibrium and aerial core grip.' },
    { icon: FaRocket, title: 'Rope Mallakhamb', text: 'Athletes execute intricate postures on a suspended cotton rope without knotting, proving unmatched grip strength.' },
    { icon: FaDumbbell, title: 'Athlete Benefits', text: 'Drastically develops core stability, muscular flexibility, spatial awareness, and neuromuscular coordination.' },
  ];

  return (
    <div className="page-wrapper pt-0 mt-0">
      {/* Hero Section - Zero Top Padding */}
      <section className="hero-section pt-0 mt-0 pb-3">
        <Container className="position-relative">
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="badge-accent mb-2">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5E00', display: 'inline-block' }} />
                  Smart India Hackathon AI Vision Platform
                </div>

                <HeroReveal>
                  <h1 className="hero-title fw-extrabold mb-2" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', lineHeight: 1.15 }}>
                    AI-Driven <span className="gradient-text">Mallakhamb</span> Pose Detection
                  </h1>
                </HeroReveal>

                <p className="lead mb-3 text-secondary-custom" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Next-generation computer vision analytics for India&apos;s traditional sport. 
                  Real-time posture scoring, MediaPipe joint tracking, and instant coach audio feedback.
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <PremiumButton as={Link} to="/live-detection">
                    <FaPlay size={12} /> Start Live Detection
                  </PremiumButton>
                  <PremiumButton as={Link} to="/pose-library" variant="outline">
                    Explore Library <FaArrowRight size={12} />
                  </PremiumButton>
                </div>
              </motion.div>
            </Col>

            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="hero-image-wrapper text-center"
              >
                <div className="hero-image-frame rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-10">
                  <img
                    src="/images/mallakhamb_action.png"
                    alt="Mallakhamb athlete performing pose on pole"
                    className="w-100 img-fluid"
                    style={{ maxHeight: 360, objectFit: 'cover' }}
                  />
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Heritage & About */}
      <section className="section-premium py-3">
        <Container>
          <Row className="g-4 mb-4 align-items-center">
            <Col lg={6}>
              <SlideLeft>
                <span className="section-label">HERITAGE &amp; ORIGINS</span>
                <h2 className="section-title mb-3 fw-bold">What is Mallakhamb?</h2>
                <p className="text-secondary-custom mb-3" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Mallakhamb is a traditional Indian sport where a gymnast performs aerial postures, flips, and grips on a vertical wooden pole, cane, or rope.
                </p>
                <p className="text-secondary-custom mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Traced back to 11th-century Indian literature and revived in the 19th century by Late Balambhatdada Deodhar, Mallakhamb is recognized globally as one of the most demanding physical discipline sports.
                </p>
              </SlideLeft>
            </Col>
            <Col lg={6}>
              <SlideRight>
                <div className="rounded-4 overflow-hidden border border-secondary border-opacity-10 shadow-lg">
                  <img
                    src="/images/mallakhamb_pole.png"
                    alt="Mallakhamb History"
                    className="w-100 img-fluid"
                    style={{ maxHeight: 280, objectFit: 'cover' }}
                  />
                </div>
              </SlideRight>
            </Col>
          </Row>

          <StaggerContainer>
            <Row className="g-4 mb-4">
              {cards.map((item, idx) => (
                <Col md={4} key={idx}>
                  <StaggerItem>
                    <div className="glass-card p-4 h-100">
                      <div
                        className="feature-icon mb-3 p-3 rounded-circle"
                        style={{ color: item.color, background: `${item.color}15`, width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <item.icon size={18} />
                      </div>
                      <h4 className="font-display fw-bold mb-2" style={{ fontSize: '1.05rem' }}>{item.title}</h4>
                      <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                    </div>
                  </StaggerItem>
                </Col>
              ))}
            </Row>
          </StaggerContainer>

          <Row className="g-4 mb-4">
            {typesCards.map((item, idx) => (
              <Col md={6} lg={3} key={idx}>
                <FadeUp delay={idx * 0.05}>
                  <div className="glass-card p-4 h-100">
                    <item.icon style={{ fontSize: '1.5rem', color: '#FF5E00', marginBottom: '0.5rem' }} />
                    <h5 className="font-display fw-bold mb-2" style={{ fontSize: '0.95rem' }}>{item.title}</h5>
                    <p className="text-muted-custom mb-0" style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
                      {item.text}
                    </p>
                  </div>
                </FadeUp>
              </Col>
            ))}
          </Row>

          {/* Architecture */}
          <div className="glass-card p-4 p-md-5 mb-4 text-center">
            <FadeUp>
              <span className="section-label">SYSTEM ARCHITECTURE</span>
              <h2 className="section-title mb-4 fw-bold">Technology Stack</h2>
              
              <Row className="g-4 text-start">
                <Col md={6}>
                  <div className="glass-card p-4 h-100" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <FaReact style={{ fontSize: '2rem', color: '#61DAFB', marginBottom: '0.75rem' }} />
                    <h5 className="font-display fw-bold mb-2">Frontend Interface</h5>
                    <ul className="text-secondary-custom mb-0" style={{ lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                      <li>React &amp; Vite Engine</li>
                      <li>MediaPipe HTML Canvas Overlay</li>
                      <li>Fast API Axios Client</li>
                      <li>Modern Athletic UI System</li>
                    </ul>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="glass-card p-4 h-100" style={{ background: 'rgba(255,94,0,0.03)', borderColor: 'rgba(255,94,0,0.2)' }}>
                    <FaPython style={{ fontSize: '2rem', color: '#FFD43B', marginBottom: '0.75rem' }} />
                    <h5 className="font-display fw-bold mb-2">Python AI Engine</h5>
                    <ul className="text-secondary-custom mb-0" style={{ lineHeight: 1.7, fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                      <li>FastAPI Asynchronous Server</li>
                      <li>MediaPipe 33-Landmark Pose Vision</li>
                      <li>YOLO Performer Auto-Zoom</li>
                      <li>Scikit-Learn Random Forest Classifier</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* Capabilities */}
      <section className="section-premium py-3">
        <Container>
          <FadeUp className="text-center mb-4">
            <span className="section-label">AI CAPABILITIES</span>
            <h2 className="section-title fw-bold">Key System Features</h2>
          </FadeUp>

          <StaggerContainer>
            <Row className="g-4">
              {features.map((feature, idx) => (
                <Col md={6} lg={4} key={idx}>
                  <StaggerItem>
                    <FeatureCard {...feature} delay={idx * 0.05} />
                  </StaggerItem>
                </Col>
              ))}
            </Row>
          </StaggerContainer>
        </Container>
      </section>

      {/* Clean Workflow Grid */}
      <section className="section-premium py-3">
        <Container>
          <FadeUp className="text-center mb-4">
            <span className="section-label">PIPELINE</span>
            <h2 className="section-title fw-bold">How It Works</h2>
            <p className="section-subtitle mx-auto" style={{ fontSize: '0.9rem' }}>
              Our end-to-end computer vision pipeline processes inputs and computes accurate pose feedback in milliseconds.
            </p>
          </FadeUp>

          <Row className="g-3 justify-content-center">
            {workflowSteps.map((step, idx) => (
              <Col xs={12} sm={6} md={4} lg={2.4} key={idx} style={{ flex: '1 0 18%' }}>
                <FadeUp delay={idx * 0.05} className="h-100">
                  <div className="glass-card p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center">
                    <span className="fw-bold mb-2" style={{ color: '#FF5E00', fontSize: '1rem', letterSpacing: '0.05em' }}>
                      {step.num}
                    </span>
                    <step.icon style={{ fontSize: '1.35rem', color: '#00F2FE', marginBottom: '0.4rem' }} />
                    <h6 className="font-display fw-bold text-white mb-1" style={{ fontSize: '0.875rem' }}>
                      {step.title}
                    </h6>
                    <small className="text-muted-custom" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                      {step.desc}
                    </small>
                  </div>
                </FadeUp>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Banner */}
      <section className="section-premium py-3">
        <Container>
          <div className="glass-card p-4 rounded-4 text-center">
            <Row className="g-4">
              <Col md={3} sm={6}><AnimatedCounter end={19} suffix=" Trained" label="Mallakhamb Poses" /></Col>
              <Col md={3} sm={6}><AnimatedCounter end={33} label="Body Landmarks" /></Col>
              <Col md={3} sm={6}><AnimatedCounter end={94} suffix="%" label="Model Accuracy" /></Col>
              <Col md={3} sm={6}><AnimatedCounter end={500} suffix="+" label="Frames Analyzed" /></Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-premium py-3">
        <Container>
          <FadeUp>
            <div 
              className="glass-card p-4 text-center rounded-4" 
              style={{ background: 'linear-gradient(135deg, rgba(18, 26, 45, 0.9), rgba(255, 94, 0, 0.08))', border: '1px solid rgba(255, 94, 0, 0.2)' }}
            >
              <span className="section-label mb-2">GET STARTED</span>
              <h2 className="section-title mb-2 fw-bold">Ready to Analyze Your Pose?</h2>
              <p className="section-subtitle mx-auto mb-3" style={{ fontSize: '0.9rem' }}>
                Launch live camera detection or upload a photo to experience AI posture evaluation.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <PremiumButton as={Link} to="/live-detection">
                  <FaCamera size={14} /> Start Live Detection
                </PremiumButton>
                <PremiumButton as={Link} to="/image-detection" variant="outline">
                  <FaImage size={14} /> Upload Image
                </PremiumButton>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
    </div>
  );
};

export default Home;
