import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import FloatingAiCoach from './components/FloatingAiCoach/FloatingAiCoach';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <AppRoutes />
        <FloatingAiCoach />
      </div>
    </ThemeProvider>
  );
}

export default App;
