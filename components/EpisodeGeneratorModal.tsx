
import React, { useState } from 'react';
import { ReferenceMap } from '../types';
import { generateFullEpisode } from '../services/geminiService';

interface EpisodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, append: boolean) => void;
  references: ReferenceMap;
}

const RANDOM_IDEAS = [
    "Tournament Arc: The protagonist enters a high-stakes fighting tournament to pay off a debt.",
    "Beach Episode: The team goes on a vacation but gets attacked by sea monsters.",
    "Training Montage: The main character must master a new technique before the sun sets.",
    "Infiltration Mission: The team must sneak into a high-tech fortress to steal a data chip.",
    "Slice of Life: The characters try to cook a meal together but everything goes wrong.",
    "Zombie Outbreak: A sudden virus turns the city into zombies, and they must escape.",
    "Cyberpunk Race: A high-speed hover-bike race through the neon city streets.",
    "Dungeon Raid: They explore an ancient ruin filled with traps and a boss guardian."
];

const EpisodeGeneratorModal: React.FC<EpisodeGeneratorModalProps> = ({ isOpen, onClose, onImport, references }) => {
  const [idea, setIdea] = useState('');
  const [sceneCount, setSceneCount] = useState(12); // Default 3 mins (12 * 15s)
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const random = RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)];
    setIdea(random);
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    try {
      const script = await generateFullEpisode(idea, sceneCount, references);
      // Automatically import as new project
      onImport(script, false); 
      onClose();
    } catch (error: any) {
      alert(`Generation Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900 border border-indigo-500/50 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-indigo-900/50 to-gray-900">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <i className="fa-solid fa-bolt text-yellow-400"></i>
               AI Episode Generator
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white">
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          <p className="text-xs text-indigo-300 mt-1">Generate a full storyboard script instantly.</p>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Idea Input */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-300">Episode Premise</label>
                    <button 
                        onClick={handleRandomize}
                        className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                    >
                        <i className="fa-solid fa-dice"></i> Random Idea
                    </button>
                </div>
                <textarea 
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g. Ayo and Rayne fight over the last slice of pizza, destroying the kitchen in the process."
                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
            </div>

            {/* Scene Count Slider */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-300">Episode Length</label>
                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded border border-gray-700 text-indigo-400">
                        {sceneCount} Scenes ({Math.floor(sceneCount * 15 / 60)}m {(sceneCount * 15) % 60}s)
                    </span>
                </div>
                <input 
                    type="range" 
                    min="4" 
                    max="40" 
                    step="1"
                    value={sceneCount}
                    onChange={(e) => setSceneCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>Short (1m)</span>
                    <span>Medium (5m)</span>
                    <span>Long (10m)</span>
                </div>
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={!idea.trim() || isGenerating}
                className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
            >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Script...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> GENERATE EPISODE
                    </>
                )}
            </button>

        </div>

      </div>
    </div>
  );
};

export default EpisodeGeneratorModal;
