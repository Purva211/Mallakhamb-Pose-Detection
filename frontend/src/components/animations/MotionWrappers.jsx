import React from 'react';

export const fadeUp = {};
export const fadeIn = {};
export const slideLeft = {};
export const slideRight = {};
export const staggerContainer = {};
export const staggerItem = {};
export const pageTransition = {};

export function FadeUp({ children, className = '', ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function FadeIn({ children, className = '', ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function SlideLeft({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function SlideRight({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function StaggerContainer({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function PageTransition({ children }) {
  return <div className="w-100">{children}</div>;
}

export function HeroReveal({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function FloatingElement({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export default PageTransition;
