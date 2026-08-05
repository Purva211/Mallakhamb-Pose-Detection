import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaYoutube, FaArrowRight } from 'react-icons/fa';
import { FadeUp } from '../animations/MotionWrappers';
import ParticlesBackground from '../effects/ParticlesBackground';

const footerLinks = {
  about: [
    { to: '/about', label: 'Our Story' },
    { to: '/research', label: 'Methodology' },
    { to: '/dashboard', label: 'Analytics' },
  ],
  quick: [
    { to: '/pose-library', label: 'Pose Library' },
    { to: '/image-detection', label: 'Image Detection' },
    { to: '/live-detection', label: 'Live Detection' },
    { to: '/video-detection', label: 'Video Detection' },
  ],
  research: [
    { to: '/research', label: 'Research Paper' },
    { to: '/research', label: 'AI Models' },
    { to: '/research', label: 'Dataset' },
  ],
  resources: [
    { to: '/contact', label: 'Support' },
    { to: '/about', label: 'Documentation' },
    { to: '/contact', label: 'FAQ' },
  ],
};

const socialLinks = [
  { icon: FaGithub, href: '#', label: 'GitHub' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="footer-premium mt-auto">
      <ParticlesBackground count={30} />
      <Container className="position-relative" style={{ zIndex: 2 }}>
        <Row className="gy-5 mb-5">
          <Col lg={4} md={6}>
            <FadeUp>
              <div className="footer-brand">
                Mallakhamb <span>AI</span>
              </div>
              <p className="text-secondary-custom mb-4" style={{ lineHeight: 1.8, maxWidth: 320 }}>
                Experience the future of India&apos;s traditional sport with Artificial Intelligence.
                Real-time pose analysis, posture correction, and performance tracking.
              </p>
              <div className="d-flex gap-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} className="footer-social-link" aria-label={label}>
                    <Icon />
                  </a>
                ))}
              </div>
            </FadeUp>
          </Col>

          <Col lg={2} md={6} sm={6}>
            <FadeUp delay={0.1}>
              <h6 className="footer-heading">About</h6>
              <ul className="list-unstyled">
                {footerLinks.about.map((link) => (
                  <li key={link.label} className="mb-2">
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </Col>

          <Col lg={2} md={6} sm={6}>
            <FadeUp delay={0.15}>
              <h6 className="footer-heading">Quick Links</h6>
              <ul className="list-unstyled">
                {footerLinks.quick.map((link) => (
                  <li key={link.label} className="mb-2">
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </Col>

          <Col lg={2} md={6} sm={6}>
            <FadeUp delay={0.2}>
              <h6 className="footer-heading">Research</h6>
              <ul className="list-unstyled">
                {footerLinks.research.map((link) => (
                  <li key={link.label} className="mb-2">
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </Col>

          <Col lg={2} md={6} sm={6}>
            <FadeUp delay={0.25}>
              <h6 className="footer-heading">Resources</h6>
              <ul className="list-unstyled">
                {footerLinks.resources.map((link) => (
                  <li key={link.label} className="mb-2">
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </Col>
        </Row>

        <FadeUp delay={0.3}>
          <Row className="align-items-center gy-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Col lg={6}>
              <h6 className="footer-heading mb-3">Newsletter</h6>
              <p className="text-muted-custom mb-3" style={{ fontSize: '0.875rem' }}>
                Stay updated with the latest AI pose detection research and features.
              </p>
              <form onSubmit={handleNewsletter} className="d-flex" style={{ maxWidth: 400 }}>
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="footer-newsletter-btn">
                  <FaArrowRight />
                </button>
              </form>
            </Col>
            <Col lg={6} className="text-lg-end">
              <h6 className="footer-heading mb-3">Contact</h6>
              <p className="text-secondary-custom mb-1" style={{ fontSize: '0.875rem' }}>contact@mallakhambai.in</p>
              <p className="text-secondary-custom mb-0" style={{ fontSize: '0.875rem' }}>+91 98765 43210</p>
            </Col>
          </Row>
        </FadeUp>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-4 mt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-muted-custom mb-0" style={{ fontSize: '0.8125rem' }}>
            &copy; {new Date().getFullYear()} AI-Driven Mallakhamb Pose Detection System. All rights reserved.
          </p>
        </motion.div>
      </Container>
    </footer>
  );
};

export default Footer;
