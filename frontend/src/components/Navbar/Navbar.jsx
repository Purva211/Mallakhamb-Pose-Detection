import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, Offcanvas, NavDropdown } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import useScrollPosition from '../../hooks/useScrollPosition';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/pose-library', label: 'Pose Library' },
  {
    label: 'Detection',
    dropdown: [
      { to: '/image-detection', label: 'Image Detection' },
      { to: '/live-detection', label: 'Live Detection' },
      { to: '/video-detection', label: 'Video Detection' },
    ]
  },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/research', label: 'Research' },
];

const NavigationBar = () => {
  const scrolled = useScrollPosition(40);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  return (
    <>
      <Navbar
        expand="lg"
        className={`navbar-custom sticky-top ${scrolled ? 'scrolled' : ''}`}
        variant="dark"
      >
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="navbar-brand-custom">
            Mallakhamb <span>AI</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setShowOffcanvas(true)}
              aria-label="Open menu"
            >
              <FaBars size={16} />
            </button>
          </div>

          <Navbar.Collapse id="main-navbar" className="d-none d-lg-flex">
            <Nav className="ms-auto">
              {navLinks.map((link, idx) => {
                if (link.dropdown) {
                  return (
                    <NavDropdown title={link.label} id={`desktop-dropdown-${idx}`} key={idx} className="custom-dropdown">
                      {link.dropdown.map((sub) => (
                        <NavDropdown.Item key={sub.to} as={NavLink} to={sub.to}>
                          {sub.label}
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>
                  );
                }
                return (
                  <Nav.Link key={link.to} as={NavLink} to={link.to} end={link.end}>
                    {link.label}
                  </Nav.Link>
                );
              })}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="mobile-nav-overlay text-white"
        style={{ background: 'rgba(7, 10, 18, 0.98)', backdropFilter: 'blur(20px)' }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="navbar-brand-custom">
            Mallakhamb <span>AI</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <AnimatePresence>
            <Nav className="flex-column gap-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.to || link.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {link.dropdown ? (
                    <NavDropdown title={link.label} id={`mobile-dropdown-${idx}`} className="py-2 px-2 custom-dropdown" style={{ fontSize: '1.1rem' }}>
                      {link.dropdown.map((sub) => (
                        <NavDropdown.Item key={sub.to} as={NavLink} to={sub.to} onClick={() => setShowOffcanvas(false)}>
                          {sub.label}
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>
                  ) : (
                    <Nav.Link
                      as={NavLink}
                      to={link.to}
                      end={link.end}
                      onClick={() => setShowOffcanvas(false)}
                      className="py-3 px-2"
                      style={{ fontSize: '1.1rem' }}
                    >
                      {link.label}
                    </Nav.Link>
                  )}
                </motion.div>
              ))}
            </Nav>
          </AnimatePresence>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavigationBar;
