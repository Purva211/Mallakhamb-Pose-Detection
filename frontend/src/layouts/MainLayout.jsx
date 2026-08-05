import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ChatbotWidget from '../components/layout/ChatbotWidget';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />
      <main className="flex-grow-1 d-flex flex-column" style={{ marginTop: 0, paddingTop: 0 }}>
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default MainLayout;
