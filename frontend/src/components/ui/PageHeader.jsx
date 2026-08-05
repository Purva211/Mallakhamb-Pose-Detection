import React from 'react';
import { FadeUp } from '../animations/MotionWrappers';

const PageHeader = ({ label, title, highlight, subtitle, centered = true }) => {
  return (
    <FadeUp className={`page-header ${centered ? '' : 'text-start'}`}>
      {label && <span className="section-label">{label}</span>}
      <h1 className="page-title">
        {title} {highlight && <span>{highlight}</span>}
      </h1>
      {subtitle && (
        <p className={`page-subtitle ${centered ? '' : 'ms-0'}`}>{subtitle}</p>
      )}
    </FadeUp>
  );
};

export default PageHeader;
