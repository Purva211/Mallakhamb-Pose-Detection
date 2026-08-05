import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaDatabase, FaProjectDiagram, FaGithub, FaChartBar, FaGlobe } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';

const cards = [
  {
    icon: FaDatabase,
    title: 'Dataset Collection',
    text: 'Since no open-source dataset exists for Mallakhamb, we collected hundreds of images and videos from local competitions and training centers. The dataset was manually annotated by professional coaches.',
    color: 'var(--primary)',
  },
  {
    icon: FaProjectDiagram,
    title: 'Upcoming Pose Estimation',
    text: 'Our Python backend utilizes MediaPipe Pose to extract 33 3D landmarks of the human body. These coordinates are normalized for scale and translation invariance before passing to our classifier.',
    color: 'var(--secondary-light)',
  },
  {
    icon: FaGithub,
    title: 'Planned Classification Network',
    text: 'A custom Random Forest classifier takes normalized landmark coordinates and classifies them into distinct Mallakhamb poses based on our training dataset.',
    color: 'var(--accent)',
  },
];

const Research = () => {
  return (
    <div className="page-wrapper pt-0 mt-0">
      <Container className="position-relative">
        <PageHeader
          label="TECHNICAL APPROACH"
          title="Research &"
          highlight="Methodology"
          subtitle="Dataset, computer vision architecture, and AI models powering this project."
        />

        <Row className="g-3 g-lg-4 mb-4">
          {cards.map((card, idx) => (
            <Col lg={4} key={idx}>
              <div className="glass-card p-4 h-100 text-center">
                <div
                  className="feature-icon feature-icon-lg mx-auto mb-3"
                  style={{ color: card.color, borderColor: `${card.color}33`, background: `${card.color}15` }}
                >
                  <card.icon />
                </div>
                <h5 className="font-display mb-2">{card.title}</h5>
                <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {card.text}
                </p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="glass-card p-4 mb-4">
          <h4 className="font-display gradient-text mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
            Geometric Analysis &amp; Scoring
          </h4>
          <p className="text-secondary-custom mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 800 }}>
            Beyond identifying the pose, our system calculates 8 key joint angles using extracted 33 landmarks.
            These angles are compared against ideal benchmarks defined by expert coaches.
            The angular variance determines the accuracy score and generates real-time correction feedback.
          </p>
        </div>

        <Row className="g-3 g-lg-4 mb-4">
          {[
            { icon: FaProjectDiagram, title: 'Workflow Pipeline', text: 'Media input → Pole detection → Pose estimation → Classification → Accuracy scoring → Report generation.' },
            { icon: FaChartBar, title: 'Expected Results', text: 'Targeting 94%+ classification accuracy on the validation set with real-time inference under 50ms per frame.' },
            { icon: FaGlobe, title: 'Future Scope', text: '3D pose trajectory tracking, mobile deployment, rope Mallakhamb support, and national level performance indexing.' },
          ].map((item, idx) => (
            <Col md={4} key={idx}>
              <div className="glass-card p-4 h-100">
                <item.icon style={{ color: 'var(--primary)', fontSize: '1.35rem', marginBottom: '0.75rem' }} />
                <h5 className="font-display mb-2">{item.title}</h5>
                <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {item.text}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Research;
