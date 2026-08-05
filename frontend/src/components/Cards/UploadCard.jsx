import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaTimes, FaFileImage, FaFileVideo } from 'react-icons/fa';

const UploadCard = ({ onFileSelect, accept = 'image/*', fileType = 'Image' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const processFile = (file) => {
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview('video');
      }
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="glass-card p-4 p-md-5 d-flex flex-column" style={{ minHeight: 420 }}>
      <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {fileType === 'Video' ? (
          <FaFileVideo style={{ color: 'var(--secondary-light)', fontSize: '1.25rem' }} />
        ) : (
          <FaFileImage style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
        )}
        <h4 className="mb-0 font-display gradient-text" style={{ fontSize: '1.25rem' }}>
          Upload {fileType}
        </h4>
      </div>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`upload-zone flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FaCloudUploadAlt className="upload-icon" />
            </motion.div>
            <h5 className="font-display mb-2" style={{ fontSize: '1.1rem' }}>
              Drag &amp; Drop your {fileType}
            </h5>
            <p className="text-muted-custom mb-4" style={{ fontSize: '0.9rem' }}>
              or click to browse files
            </p>
            <button type="button" className="btn-premium" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse Files
            </button>
            <input ref={inputRef} type="file" accept={accept} className="d-none" onChange={handleChange} />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-grow-1 position-relative d-flex flex-column"
          >
            <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 3 }}>
              <button
                type="button"
                className="btn rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, background: 'rgba(248,113,113,0.2)', color: '#F87171', border: 'none' }}
                onClick={handleRemove}
              >
                <FaTimes />
              </button>
            </div>
            <div
              className="flex-grow-1 rounded d-flex align-items-center justify-content-center overflow-hidden mb-3"
              style={{ background: 'rgba(255,255,255,0.02)', minHeight: 300, border: '1px solid var(--border)' }}
            >
              {preview === 'video' ? (
                <div className="text-center p-5">
                  <FaFileVideo style={{ fontSize: '3rem', color: 'var(--secondary-light)', marginBottom: '1rem' }} />
                  <h5 className="font-display">{fileName}</h5>
                  <p className="text-muted-custom mb-0">Video ready for processing</p>
                </div>
              ) : (
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadCard;
