import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Toaster } from 'sonner';

// Pages
import SaveSelection from './pages/SaveSelection';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Matches from './pages/Matches';
import CalendarPage from './pages/Calendar';
import Statistics from './pages/Statistics';
import Office from './pages/Office';
import Museum from './pages/Museum';

// Components
import AppLayout from './components/AppLayout';

// Main App Content
const AppContent = () => {
  const { currentSave, loading } = useGame();
  const [activePage, setActivePage] = useState('dashboard');

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-heading uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  // No save loaded - show save selection
  if (!currentSave) {
    return <SaveSelection />;
  }

  // Render active page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'squad':
        return <Squad />;
      case 'matches':
        return <Matches />;
      case 'calendar':
        return <CalendarPage />;
      case 'office':
        return <Office />;
      case 'museum':
        return <Museum />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </AppLayout>
  );
};

// Root App with Providers
function App() {
  return (
    <GameProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          },
          className: 'font-body',
        }}
      />
    </GameProvider>
  );
}

export default App;
