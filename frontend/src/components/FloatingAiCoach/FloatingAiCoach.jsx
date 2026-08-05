import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { 
  FaPaperPlane, FaRobot, FaUser, FaCheckCircle, FaExclamationTriangle,
  FaTimes, FaChevronDown, FaCommentDots
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumButton from '../ui/PremiumButton';
import { getChatbotStatus, queryChatbot } from '../../services/api';

const FloatingAiCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Mallakhamb AI Coach. I have been trained on the master manuals and competition guidelines. Ask me any questions about pose specifications, execution details, rules, or performance standards!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    ready: false,
    engine: null,
    error: null
  });

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getChatbotStatus();
        if (res.success && res.data) {
          setStatus(res.data);
        }
      } catch (err) {
        console.error("Failed to load chatbot status:", err);
      }
    };
    fetchStatus();
    
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await queryChatbot(text);
      
      const botMsg = {
        sender: 'bot',
        text: res.answer || "I'm sorry, I encountered an issue processing that query.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: res.engine || "AI Core",
        sources: res.sources || []
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        sender: 'bot',
        text: "Could not establish a connection to the local chatbot service. Please ensure the backend server and Docker containers are running.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '16px',
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 'min(calc(100vw - 48px), 400px)',
                height: 'min(calc(100vh - 120px), 600px)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
              className="chat-window-mobile-override"
            >
              <Card className="glass-card border-0 d-flex flex-column h-100 m-0">
                <Card.Header className="bg-dark bg-opacity-80 p-3 border-bottom border-secondary border-opacity-20 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-warning bg-opacity-10 rounded-circle text-warning">
                      <FaRobot />
                    </div>
                    <div>
                      <h6 className="mb-0 font-display text-white">Coach Assistant</h6>
                      <div style={{ fontSize: '0.7rem' }}>
                        {status.ready ? (
                          <span className="text-success">Active: {status.engine}</span>
                        ) : (
                          <span className="text-danger">Offline mode</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="btn btn-link text-white p-0 border-0"
                    style={{ opacity: 0.7 }}
                  >
                    <FaTimes size={18} />
                  </button>
                </Card.Header>

                <Card.Body className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3" style={{ background: 'rgba(7, 10, 18, 0.95)' }}>
                  {messages.map((msg, idx) => {
                    const isBot = msg.sender === 'bot';
                    return (
                      <div key={idx} className={`d-flex ${isBot ? 'justify-content-start' : 'justify-content-end'}`}>
                        <div className={`d-flex gap-2 max-w-85 ${isBot ? 'flex-row' : 'flex-row-reverse'}`} style={{ maxWidth: '85%' }}>
                          <div 
                            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                            style={{ 
                              width: 28, height: 28, 
                              background: isBot ? 'rgba(255, 94, 0, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                              color: isBot ? 'var(--primary)' : 'var(--secondary-light)',
                              border: isBot ? '1px solid rgba(255, 94, 0, 0.3)' : '1px solid rgba(0, 242, 254, 0.3)'
                            }}
                          >
                            {isBot ? <FaRobot size={12} /> : <FaUser size={12} />}
                          </div>

                          <div className="d-flex flex-column">
                            <div 
                              className="p-2 rounded-4 text-break"
                              style={{ 
                                background: isBot ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #FF5E00, #FF8533)',
                                color: isBot ? '#E2E8F0' : '#fff',
                                border: isBot ? '1px solid var(--border)' : 'none',
                                borderRadius: isBot ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                                fontSize: '0.85rem',
                                lineHeight: 1.5,
                              }}
                            >
                              {msg.text}
                            </div>
                            
                            <div className={`d-flex gap-2 mt-1 ${isBot ? 'justify-content-start' : 'justify-content-end'} text-muted`} style={{ fontSize: '0.65rem' }}>
                              <span>{msg.time}</span>
                            </div>

                            {isBot && msg.sources && msg.sources.length > 0 && (
                              <div className="mt-1 p-2 rounded bg-dark bg-opacity-30 border border-secondary border-opacity-10" style={{ fontSize: '0.7rem' }}>
                                <div className="text-warning mb-1">Sources:</div>
                                <ul className="mb-0 ps-3 text-muted-custom">
                                  {msg.sources.map((src, sIdx) => (
                                    <li key={sIdx}>Pg {src.metadata?.pageNumber || src.metadata?.loc?.pageNumber || 'N/A'}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="d-flex justify-content-start">
                      <div className="d-flex gap-2 align-items-center">
                        <div 
                          className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning"
                          style={{ width: 28, height: 28, border: '1px solid rgba(245, 158, 11, 0.3)' }}
                        >
                          <FaRobot size={12} />
                        </div>
                        <div className="bg-elevated p-2 rounded-4 d-flex gap-1 align-items-center" style={{ borderRadius: '0px 16px 16px 16px', border: '1px solid var(--border)' }}>
                          <span className="spinner-grow spinner-grow-sm text-warning" style={{ width: 4, height: 4 }} role="status"></span>
                          <span className="spinner-grow spinner-grow-sm text-warning" style={{ width: 4, height: 4, animationDelay: '0.2s' }} role="status"></span>
                          <span className="spinner-grow spinner-grow-sm text-warning" style={{ width: 4, height: 4, animationDelay: '0.4s' }} role="status"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </Card.Body>

                <Card.Footer className="bg-dark bg-opacity-80 p-2 border-top border-secondary border-opacity-20">
                  <Form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Ask AI Coach..."
                        className="bg-dark border-secondary text-white py-2 px-3 m-0"
                        style={{ fontSize: '0.85rem', borderRadius: '50px 0 0 50px' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                      />
                      <PremiumButton
                        type="submit"
                        disabled={!input.trim() || loading}
                        style={{ borderRadius: '0 50px 50px 0', padding: '0.5rem 1rem', margin: 0 }}
                      >
                        <FaPaperPlane size={14} />
                      </PremiumButton>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-warning rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #FF5E00, #FF8533)',
            border: 'none',
            color: 'white',
            zIndex: 10000
          }}
        >
          {isOpen ? <FaChevronDown size={24} /> : <FaRobot size={28} />}
        </motion.button>
      </div>
      
      {/* Mobile override for full screen */}
      <style>{`
        @media (max-width: 576px) {
          .chat-window-mobile-override {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            z-index: 9999 !important;
          }
          .chat-window-mobile-override .glass-card {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingAiCoach;
