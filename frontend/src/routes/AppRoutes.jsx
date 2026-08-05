import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

import Home from '../pages/Home';
import LiveDetection from '../pages/LiveDetection';
import ImageDetection from '../pages/ImageDetection';
import PoseLibrary from '../pages/PoseLibrary';
import Dashboard from '../pages/Dashboard';

const VideoDetection = lazy(() => import('../pages/VideoDetection'));
const Research = lazy(() => import('../pages/Research'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-100">
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live-detection" element={<LiveDetection />} />
          <Route path="/image-detection" element={<ImageDetection />} />
          <Route path="/pose-library" element={<PoseLibrary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/video-detection" element={<VideoDetection />} />
          <Route path="/research" element={<Research />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
