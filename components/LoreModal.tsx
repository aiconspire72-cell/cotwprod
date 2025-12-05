
import React, { useState, useEffect } from 'react';
import { INITIAL_LORE } from '../constants';

interface LoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  lore: string;
  onSave: (newLore: string) => void;
}

const LoreModal: React.FC<LoreModalProps> = ({ isOpen, onClose, lore, onSave }) => {
  const [localLore, setLocalLore] = useState(lore);

  useEffect(() => {
    setLocalLore(lore);
  }, [lore, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localLore);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm("Reset to default 'Destiny Cup' lore?")) {
        setLocalLore(INITIAL_LORE);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900 border border-yellow-500/50 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-yellow-900/30 to-gray-900">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <i className="fa-solid fa-book-journal-whills text-yellow-400"></i>
               World Lore & Settings
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white">
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          <p className="text-xs text-yellow-300/70 mt-1">
            Define the rules, tone, and history of your world. The AI will use this context for all script generation.
          </p>
        </div>

        <div className="p-6 flex-grow flex flex-col overflow-hidden">
            <textarea
                value={localLore}
                onChange={(e) => setLocalLore(e.target.value)}
                placeholder="Describe your world here. E.g. 'In a world where music is magic...'"
                className="flex-grow w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none resize-none font-mono leading-relaxed custom-scrollbar"
            ></textarea>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-850 flex justify-between items-center">
            <button 
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-red-400 font-semibold"
            >
                Reset to Default
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-500/20 transition-all"
                >
                    Save Lore
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoreModal;
