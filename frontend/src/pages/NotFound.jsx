import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PremiumButton from '../components/ui/PremiumButton';
import GlowOrb from '../components/effects/GlowOrb';

const NotFound = () => {
  return (
    <div className="page-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <GlowOrb color="primary" size={300} style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center position-relative"
        style={{ zIndex: 2 }}
      >
        <h1 className="hero-title gradient-text mb-3" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)' }}>404</h1>
        <h3 className="font-display mb-3">Page Not Found</h3>
        <p className="text-muted-custom mb-5" style={{ maxWidth: 400, margin: '0 auto' }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <PremiumButton as={Link} to="/">Return Home</PremiumButton>
      </motion.div>
    </div>
  );
};

export default NotFound;
