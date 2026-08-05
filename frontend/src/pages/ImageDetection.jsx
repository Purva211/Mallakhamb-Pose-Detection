import React, { useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaDownload, FaRedo, FaSearch } from 'react-icons/fa';
import UploadCard from '../components/Cards/UploadCard';
import ResultCard from '../components/Cards/ResultCard';
import PageHeader from '../components/ui/PageHeader';
import PremiumButton from '../components/ui/PremiumButton';
import { predictImage } from '../services/api';

const ImageDetection = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await predictImage(formData);
      if (response && response.data) {
        setResult(response.data);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="page-wrapper pt-0 mt-0">
      <Container className="position-relative">
        <PageHeader
          label="AI ANALYSIS"
          title="Image"
          highlight="Detection"
          subtitle="Upload an image of a Mallakhamb pose for instant AI-powered analysis and posture correction."
        />

        <Row className="g-3 g-lg-4">
          <Col lg={result ? 6 : 8} className={!result ? 'mx-auto' : ''}>
            <div>
              <UploadCard
                fileType="Image"
                accept="image/*"
                onFileSelect={(f) => {
                  setFile(f);
                  setResult(null);
                }}
              />
              <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                <PremiumButton onClick={handlePredict} disabled={!file || loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Analyze Pose
                    </>
                  )}
                </PremiumButton>
                {result && (
                  <PremiumButton variant="outline" onClick={handleReset}>
                    <FaRedo /> Reset
                  </PremiumButton>
                )}
              </div>
            </div>
          </Col>

          {result && (
            <Col lg={6}>
              <div>
                <ResultCard result={result} />
                <div className="text-end mt-3">
                  <PremiumButton variant="outline">
                    <FaDownload /> Download Report
                  </PremiumButton>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default ImageDetection;
