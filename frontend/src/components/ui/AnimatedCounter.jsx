import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedCounter = ({ end, suffix = '', duration = 2000, label, className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      className={`stat-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="stat-value">
        {count}
        {suffix}
      </div>
      {label && <div className="stat-label mt-2">{label}</div>}
    </motion.div>
  );
};

export default AnimatedCounter;
