import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  hover = true,
  padding = 'p-4',
  onClick,
  style = {},
}) => {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -6 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      className={`glass-card ${!hover ? 'glass-card-static' : ''} ${padding} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
