import React from 'react';
import { motion } from 'framer-motion';
import { ListGroup } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaAward, FaEye } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const accuracyColor = result.accuracy > 90 ? 'var(--success)' : result.accuracy > 70 ? 'var(--primary)' : '#F87171';

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 p-md-5 h-100 d-flex flex-column"
    >
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="d-flex align-items-center gap-3">
          <FaAward style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
          <h4 className="mb-0 font-display gradient-text" style={{ fontSize: '1.25rem' }}>
            Detection Results
          </h4>
        </div>
        {result.grade && (
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.35rem 1rem',
              borderRadius: 50,
              background: 'rgba(255, 153, 51, 0.15)',
              color: 'var(--primary)',
              letterSpacing: '0.05em',
            }}
          >
            {result.grade}
          </span>
        )}
      </div>

      {result.image && (
        <div className="mb-4 text-center position-relative rounded overflow-hidden" style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
          <img
            src={result.image}
            alt="Annotated Pose Skeleton"
            style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }}
          />
          <div className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded d-flex align-items-center gap-1" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.75rem' }}>
            <FaEye style={{ color: 'var(--accent)' }} /> Skeleton Overlay
          </div>
        </div>
      )}

      <div className="row g-4 mb-4 align-items-center">
        <div className="col-6 d-flex flex-column align-items-center">
          <div style={{ width: 110, height: 110 }}>
            <CircularProgressbar
              value={result.accuracy || 0}
              text={`${result.accuracy || 0}%`}
              styles={buildStyles({
                textSize: '18px',
                textColor: 'var(--text-primary)',
                pathColor: accuracyColor,
                trailColor: 'rgba(255,255,255,0.06)',
                pathTransitionDuration: 1,
              })}
            />
          </div>
          <span className="stat-label mt-3">Accuracy Score</span>
        </div>
        <div className="col-6 d-flex flex-column justify-content-center gap-3">
          <div>
            <span className="stat-label d-block mb-1">Detected Pose</span>
            <div className="font-display gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {result.poseName || 'Unknown'}
            </div>
          </div>
          <div>
            <span className="stat-label d-block mb-1">Confidence</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
              {result.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <span className="stat-label">Confidence Level</span>
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{result.confidence}%</span>
        </div>
        <div className="confidence-meter">
          <motion.div
            className="confidence-meter-fill"
            initial={{ width: 0 }}
            animate={{ width: `${result.confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <h5 className="font-display mb-3" style={{ fontSize: '1rem' }}>Detection Status</h5>
      <ListGroup variant="flush">
        {[
          { label: 'Pole Detected', ok: result.poleDetected !== false },
          { label: 'Person Detected', ok: result.personDetected !== false },
          { label: 'Classification Confidence', value: `${result.confidence}%` },
        ].map((item, idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-between align-items-center px-0"
            style={{ background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border)', fontSize: '0.9rem' }}
          >
            <span className="text-secondary-custom">{item.label}</span>
            {item.value ? (
              <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{item.value}</span>
            ) : item.ok ? (
              <FaCheckCircle style={{ color: 'var(--success)' }} />
            ) : (
              <FaExclamationTriangle style={{ color: '#F87171' }} />
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {result.corrections?.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <h5 className="font-display mb-3" style={{ fontSize: '1rem', color: 'var(--accent)' }}>
            🗣️ Coach Feedback &amp; Corrections
          </h5>
          <ul className="text-secondary-custom ps-3 mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
            {result.corrections.map((corr, idx) => (
              <li key={idx} style={{ color: corr.includes('Perfect') ? 'var(--success)' : 'var(--text-primary)' }}>
                {corr}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ResultCard;
