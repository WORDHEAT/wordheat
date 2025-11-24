
import React, { useState } from 'react';
import { X, Flame, Thermometer, ChevronRight } from 'lucide-react';

interface TutorialOverlayProps {
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to WordHeat",
      content: (
        <>
          <p className="mb-4 text-slate-300">
            This is <strong className="text-white">NOT</strong> a spelling game like Wordle.
          </p>
          <p className="text-slate-300">
            Your goal is to find the secret word by guessing words with <strong className="text-emerald-400">SIMILAR MEANINGS</strong>.
          </p>
        </>
      ),
      icon: <Flame size={32} className="text-orange-500" />
    },
    {
      title: "The Heat System",
      content: (
        <>
          <p className="mb-4 text-slate-300">
            We use a <strong className="text-white">temperature</strong> scale to show how close you are:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
              <span className="text-blue-300">Cold (Unrelated)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-orange-300">Hot (Conceptually Close)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"></div>
              <span className="text-red-300">Burning (Synonym)</span>
            </div>
          </div>
        </>
      ),
      icon: <Thermometer size={32} className="text-blue-400" />
    },
    {
      title: "Give it a Try!",
      content: (
        <>
          <p className="mb-4 text-slate-300">
            The secret word for this tutorial is related to <strong className="text-white">Hydration</strong>.
          </p>
          <p className="text-slate-300 bg-slate-800 p-3 rounded-xl border border-slate-700/50">
            Try guessing: <strong className="text-emerald-400">"DRINK"</strong> or <strong className="text-emerald-400">"OCEAN"</strong> to see the heat bar change!
          </p>
        </>
      ),
      icon: <ChevronRight size={32} className="text-emerald-400" />
    }
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-pop">
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-lg">
            {current.icon}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">{current.title}</h3>
          <div className="text-base leading-relaxed w-full mb-8">
            {current.content}
          </div>

          <div className="flex gap-2 w-full">
            <div className="flex justify-center gap-1.5 absolute bottom-6 left-0 right-0 pointer-events-none">
               {steps.map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-slate-700'}`}></div>
               ))}
            </div>
            
            <button 
              onClick={handleNext}
              className="w-full py-3.5 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? 'Start Playing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
