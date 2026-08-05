import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay = 0, color = 'var(--primary)' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="glass-card p-4 h-100"
    >
      <div
        className="feature-icon mb-4"
        style={{ color, borderColor: `${color}33`, background: `${color}15` }}
      >
        <Icon />
      </div>
      <h4 className="mb-3 font-display" style={{ fontSize: '1.15rem' }}>{title}</h4>
      <p className="text-muted-custom mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
