import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const Icon = type === 'privacy' ? Shield : FileText;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-pop" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <Icon size={20} strokeWidth={2.5} />
            </div>
            {title}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto text-slate-300 space-y-4 text-sm leading-relaxed scrollbar-hide">
            {type === 'privacy' ? (
                <>
                    <p><strong>Last Updated: October 2025</strong></p>
                    <p>At WordHeat, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.</p>
                    
                    <h4 className="text-white font-bold text-base mt-4">1. Information We Collect</h4>
                    <p>We collect minimal data to provide the game experience:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Game Data:</strong> Scores, guesses, and unlocked achievements.</li>
                        <li><strong>Account Info:</strong> If you sign up, we store your username, email (optional), and avatar preference.</li>
                        <li><strong>Technical Data:</strong> Device type and browser version for optimization.</li>
                    </ul>

                    <h4 className="text-white font-bold text-base mt-4">2. How We Use Your Data</h4>
                    <p>Your data is used strictly to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Maintain your progress and leaderboard stats.</li>
                        <li>Generate semantic game content using AI services.</li>
                        <li>Improve game balance and features.</li>
                    </ul>

                    <h4 className="text-white font-bold text-base mt-4">3. Third-Party Services</h4>
                    <p>We use Google Gemini API for generating word associations. No personal user data is sent to the AI model, only game-related text (guesses).</p>
                </>
            ) : (
                <>
                     <p><strong>Last Updated: October 2025</strong></p>
                     <p>By accessing or playing WordHeat, you agree to be bound by these Terms of Service.</p>

                     <h4 className="text-white font-bold text-base mt-4">1. License to Play</h4>
                     <p>WordHeat grants you a personal, non-exclusive, non-transferable license to play the game for personal entertainment.</p>

                     <h4 className="text-white font-bold text-base mt-4">2. User Conduct</h4>
                     <p>You agree not to:</p>
                     <ul className="list-disc pl-5 space-y-1">
                        <li>Use cheats, automation software (bots), or hacks.</li>
                        <li>Harass other players in multiplayer modes.</li>
                        <li>Attempt to reverse engineer the game code.</li>
                     </ul>

                     <h4 className="text-white font-bold text-base mt-4">3. Virtual Currency</h4>
                     <p>"Coins" are a virtual game currency with no real-world value. They cannot be exchanged for cash or transferred to other accounts.</p>

                     <h4 className="text-white font-bold text-base mt-4">4. Disclaimer</h4>
                     <p>The game is provided "as is" without warranties of any kind. We are not responsible for data loss or service interruptions.</p>
                </>
            )}
        </div>
        
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 text-center shrink-0">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};