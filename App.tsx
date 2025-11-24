
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import { UserProvider, useUser } from './context/UserContext';
import { AchievementToast } from './components/AchievementToast';
import { AuthModal } from './components/AuthModal';

// Inner component to access Context
const AppContent: React.FC = () => {
  const { activeToasts, removeToast, isAuthModalOpen } = useUser();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>

      {/* Controlled by Context */}
      <AuthModal isOpen={isAuthModalOpen} />

      {/* Global Notification Overlay */}
      <div className="fixed bottom-4 left-0 right-0 z-[150] flex flex-col items-center pointer-events-none px-4">
        {activeToasts.map(n => (
          <AchievementToast 
            key={n.id} 
            notification={n} 
            onClose={() => removeToast(n.id)} 
          />
        ))}
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
