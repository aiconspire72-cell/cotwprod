
import React, { useState } from 'react';
import { CharacterMap } from '../types';
import { generateScriptFromIdea, breakScriptDown } from '../services/geminiService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, append: boolean) => void;
  characters: CharacterMap;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, characters }) => {
  const [text, setText] = useState('');
  const [append, setAppend] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  
  // AI Generator State
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  if (!isOpen) return null;

  const handleImport = () => {
    if (!text.trim()) return;
    onImport(text, append);
    // Reset states
    setText('');
    setIdeaPrompt('');
    setActiveTab('manual');
    onClose();
  };

  const handleGenerateScript = async () => {
    if (!ideaPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const script = await generateScriptFromIdea(ideaPrompt, characters);
      setText(prev => prev ? prev + "\n\n" + script : script);
      setActiveTab('manual'); // Switch to editor view to review
    } catch (error) {
      alert("Failed to generate script. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBreakDown = async () => {
    if (!text.trim()) return;
    setIsBreakingDown(true);
    try {
      const optimizedScript = await breakScriptDown(text, characters);
      setText(optimizedScript);
    } catch (error) {
      alert("Failed to break down script. Try again or check the console.");
    } finally {
      setIsBreakingDown(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-850">
          <div className="flex items-center gap-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-file-pen text-pink-500"></i>
              Script Editor
            </h3>
            
            {/* Tabs */}
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
               <button 
                 onClick={() => setActiveTab('manual')}
                 className={`px-4 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'manual' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
               >
                 Editor / Manual
               </button>
               <button 
                 onClick={() => setActiveTab('ai')}
                 className={`px-4 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
               >
                 <i className="fa-solid fa-wand-magic-sparkles"></i> AI Generator
               </button>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto bg-gray-900">
          
          {activeTab === 'manual' ? (
            <div className="p-6 h-full flex flex-col relative">
               <div className="flex justify-between items-start mb-4">
                  <p className="text-sm text-gray-400">
                    Paste your raw script below.
                    <br/>
                    <span className="text-xs opacity-70">Tip: Use @character handles to link uploaded images.</span>
                  </p>
                  
                  {text.trim().length > 20 && (
                    <button 
                      onClick={handleBreakDown}
                      disabled={isBreakingDown}
                      className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-300 hover:text-white border border-indigo-500/50 rounded px-3 py-1.5 transition-colors flex items-center gap-2 shadow-lg"
                      title="AI will analyze flow and stitch scenes seamlessly"
                    >
                      {isBreakingDown ? (
                        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <i className="fa-solid fa-puzzle-piece"></i>
                      )}
                      Piece-by-Piece Breakdown
                    </button>
                  )}
               </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your rough script or notes here...&#10;&#10;Ayo fights Rayne. They punch each other. Then Hana stops them."
                className="flex-grow min-h-[300px] bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 font-mono text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none custom-scrollbar"
              ></textarea>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
               <div className="max-w-xl w-full">
                 <div className="mb-6">
                    <div className="w-16 h-16 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                        <i className="fa-solid fa-brain text-indigo-400 text-3xl"></i>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Generate Script with Gemini</h4>
                    <p className="text-sm text-gray-400">
                      Describe your episode, scene, or fight idea. The AI will write a formatted script using your uploaded characters.
                    </p>
                 </div>

                 <textarea
                    value={ideaPrompt}
                    onChange={(e) => setIdeaPrompt(e.target.value)}
                    placeholder="Example: Write a high-stakes battle where Ayo fights Haka on a crumbling bridge over lava. Hana tries to intervene with a sniper rifle."
                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none mb-6"
                 ></textarea>

                 <button 
                    onClick={handleGenerateScript}
                    disabled={!ideaPrompt.trim() || isGenerating}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Writing Script...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-pen-nib"></i> Generate Script
                      </>
                    )}
                  </button>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-850 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="appendMode" 
              checked={append} 
              onChange={(e) => setAppend(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="appendMode" className="text-sm text-gray-300 select-none cursor-pointer">
              Append to existing (keep current cards)
            </label>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={!text.trim()}
              className="px-6 py-2 rounded-lg text-sm font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Parse & Import to Timeline
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImportModal;
