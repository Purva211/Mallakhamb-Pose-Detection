import React from 'react';

const GlowOrb = ({ color = 'primary', size = 400, style = {}, className = '' }) => {
  const colorClass = {
    primary: 'glow-orb-primary',
    secondary: 'glow-orb-secondary',
    accent: 'glow-orb-accent',
  }[color] || 'glow-orb-primary';

  return (
    <div
      className={`glow-orb ${colorClass} ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
};

export default GlowOrb;
