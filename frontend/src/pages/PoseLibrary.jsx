import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getPoses } from '../services/api';
import { poses as fallbackPoses } from '../utils/dummyData';
import PageHeader from '../components/ui/PageHeader';
import { PageTransition, FadeUp } from '../components/animations/MotionWrappers';

const difficultyClass = (d) => {
  if (d === 'Beginner') return 'difficulty-beginner';
  if (d === 'Intermediate') return 'difficulty-intermediate';
  return 'difficulty-advanced';
};

const PoseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [allPoses, setAllPoses] = useState([]);
  const [filteredPoses, setFilteredPoses] = useState([]);
  const [selectedPose, setSelectedPose] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoses = async () => {
      setLoading(true);
      try {
        const response = await getPoses();
        if (response && response.success && response.data && response.data.length > 0) {
          const merged = response.data.map((p, idx) => {
            const fallback = fallbackPoses.find((f) => f.name.toLowerCase() === p.name.toLowerCase() || f.title === p.title);
            return {
              ...p,
              image: fallback?.image || fallbackPoses[idx % fallbackPoses.length].image,
              landmarks: p.landmarks || 33,
              accuracy: p.accuracy || 95
            };
          });
          setAllPoses(merged);
          setFilteredPoses(merged);
        } else {
          setAllPoses(fallbackPoses);
          setFilteredPoses(fallbackPoses);
        }
      } catch (err) {
        console.error("Failed to load poses:", err);
        setAllPoses(fallbackPoses);
        setFilteredPoses(fallbackPoses);
      } finally {
        setLoading(false);
      }
    };
    fetchPoses();
  }, []);

  useEffect(() => {
    let result = allPoses;
    if (filter !== 'All') result = result.filter((p) => p.difficulty === filter);
    if (searchTerm) result = result.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())));
    setFilteredPoses(result);
  }, [searchTerm, filter, allPoses]);

  return (
    <PageTransition>
      <div className="page-wrapper">
        <Container className="position-relative">
          <PageHeader
            label="POSE DATABASE"
            title="Pose"
            highlight="Library"
            subtitle="Browse our curated database of trained Mallakhamb poses with difficulty ratings and joint targets."
          />

          <FadeUp>
            <Row className="mb-4 justify-content-center g-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="input-group-text-custom">
                    <FaSearch style={{ color: '#FF5E00' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search poses..."
                    className="form-control-custom"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select className="form-select-custom" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="All">All Difficulties</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Form.Select>
              </Col>
            </Row>
          </FadeUp>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
              <p className="mt-3 text-muted-custom">Loading Mallakhamb pose library...</p>
            </div>
          ) : (
            <Row className="g-3 g-lg-4">
              <AnimatePresence mode="popLayout">
                {filteredPoses.map((pose, idx) => (
                  <Col sm={6} lg={4} xl={3} key={pose.id || idx}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="glass-card overflow-hidden h-100"
                      style={{ cursor: 'pointer', padding: 0 }}
                      onClick={() => setSelectedPose(pose)}
                    >
                      <div className="position-relative overflow-hidden">
                        <img
                          src={pose.image}
                          alt={pose.title || pose.name}
                          className="w-100"
                          style={{ height: 200, objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />
                        <div
                          className="position-absolute bottom-0 start-0 end-0 p-3"
                          style={{ background: 'linear-gradient(transparent, rgba(7,10,18,0.95))' }}
                        >
                          <span
                            className={difficultyClass(pose.difficulty)}
                            style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 50, letterSpacing: '0.05em' }}
                          >
                            {pose.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h5 className="font-display fw-bold mb-1" style={{ fontSize: '1rem' }}>{pose.title || pose.name}</h5>
                        <p className="text-muted-custom mb-0 line-clamp-2" style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
                          {pose.description}
                        </p>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </AnimatePresence>
              {filteredPoses.length === 0 && (
                <Col xs={12} className="text-center py-5">
                  <p className="text-muted-custom">No poses found matching your criteria.</p>
                </Col>
              )}
            </Row>
          )}

          <Modal show={selectedPose !== null} onHide={() => setSelectedPose(null)} size="lg" centered>
            {selectedPose && (
              <>
                <Modal.Header closeButton>
                  <Modal.Title className="font-display gradient-text fw-bold">{selectedPose.title || selectedPose.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  <Row className="g-0">
                    <Col md={6}>
                      <img
                        src={selectedPose.image}
                        alt={selectedPose.title || selectedPose.name}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: 'cover', minHeight: 280 }}
                      />
                    </Col>
                    <Col md={6} className="p-4 d-flex flex-column justify-content-center">
                      <div className="mb-3">
                        <span className="stat-label d-block mb-1">Difficulty</span>
                        <span
                          className={difficultyClass(selectedPose.difficulty)}
                          style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.9rem', borderRadius: 50 }}
                        >
                          {selectedPose.difficulty}
                        </span>
                      </div>
                      <div className="mb-3">
                        <span className="stat-label d-block mb-1">Description</span>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedPose.description}</p>
                      </div>
                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="glass-card p-3 text-center">
                            <div className="stat-value" style={{ fontSize: '1.2rem', color: '#FF5E00' }}>{selectedPose.landmarks || 33}</div>
                            <small className="stat-label">Landmarks</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="glass-card p-3 text-center">
                            <div className="stat-value" style={{ fontSize: '1.2rem', color: '#10B981' }}>{selectedPose.accuracy || 95}%</div>
                            <small className="stat-label">Accuracy</small>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Modal.Body>
              </>
            )}
          </Modal>
        </Container>
      </div>
    </PageTransition>
  );
};

export default PoseLibrary;
