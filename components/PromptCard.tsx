
import React, { useState, useEffect } from 'react';
import { PromptData, ReferenceMap, GenerationResult } from '../types';

interface PromptCardProps {
  prompt: PromptData;
  index: number;
  totalPrompts: number;
  characterMap: ReferenceMap;
  generationState: GenerationResult;
  onUpdateContent: (id: string, newContent: string) => void;
  onGenerate: (id: string) => void;
  onRefine: (id: string, instruction: string) => void;
  onDelete: (id: string) => void;
  onViewImage: (url: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onInsert: (index: number, position: 'before' | 'after') => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  index,
  totalPrompts,
  characterMap, 
  generationState,
  onUpdateContent,
  onGenerate,
  onRefine,
  onDelete,
  onViewImage,
  onMove,
  onInsert
}) => {
  const [localContent, setLocalContent] = useState(prompt.content);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInput, setRefineInput] = useState('');

  useEffect(() => {
    setLocalContent(prompt.content);
  }, [prompt.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (localContent !== prompt.content) {
            onUpdateContent(prompt.id, localContent);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [localContent, prompt.id, prompt.content, onUpdateContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleRefineSubmit = () => {
    if (refineInput.trim()) {
      onRefine(prompt.id, refineInput);
      setRefineInput('');
      setIsRefining(false);
    }
  };

  const isGenerating = generationState.loading;
  const hasImage = !!generationState.imageUrl;
  const hasError = !!generationState.error;

  return (
    <div className="relative group/card mb-6 last:mb-0">
        
        {/* Continuity Stitching Indicator (Between cards) */}
        {index > 0 && (
            <div className="absolute -top-10 left-8 sm:left-12 flex flex-col items-center justify-center h-10 w-0.5 bg-indigo-500/20 z-0">
                <div className="bg-gray-900 border border-indigo-500/30 rounded px-2 py-0.5 text-[8px] text-indigo-400 font-mono tracking-tighter uppercase whitespace-nowrap shadow-sm transform -translate-y-1/2">
                    <i className="fa-solid fa-link mr-1"></i> Context Linked
                </div>
            </div>
        )}

        <div className={`relative flex flex-col sm:flex-row gap-0 rounded-xl overflow-hidden border transition-all duration-300 ${isGenerating ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-gray-700 bg-gray-800'}`}>
            
            {/* Sequence Tab (Left Anchor) */}
            <div className="w-full sm:w-24 bg-gray-850 sm:border-r border-b sm:border-b-0 border-gray-700 flex flex-row sm:flex-col items-center sm:justify-center justify-between p-3 sm:p-0 gap-1 flex-shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SEQ</span>
                    <span className="text-2xl font-black text-white">{prompt.id}</span>
                </div>
                <div className="h-px w-8 bg-gray-700 my-1 hidden sm:block"></div>
                <div className="text-[10px] font-mono text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">
                    {prompt.time.split(' - ')[0]}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-grow p-4 flex flex-col relative bg-gray-900/50">
                
                {/* Visual Context Highlighting (Tags) */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {prompt.characters.length === 0 && <span className="text-[10px] text-gray-600 italic">No context tags detected</span>}
                    {prompt.characters.map(refId => {
                        const ref = characterMap[refId];
                        if (!ref) return null;
                        const isLoc = ref.type === 'location';
                        return (
                            <span 
                            key={refId} 
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1.5 cursor-help transition-all hover:opacity-80 ${isLoc ? 'bg-green-900/20 border-green-500/20 text-green-400' : 'bg-pink-900/20 border-pink-500/20 text-pink-400'}`}
                            title={ref.description}
                            >
                            <i className={`fa-solid ${isLoc ? 'fa-map' : 'fa-user'} text-[9px]`}></i> {ref.name}
                            </span>
                        );
                    })}
                </div>

                {/* Magic Edit Bar */}
                {isRefining && (
                    <div className="mb-3 p-2 bg-indigo-900/20 border border-indigo-500/30 rounded-lg animate-in slide-in-from-top-2">
                        <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={refineInput}
                            onChange={(e) => setRefineInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                            placeholder="AI Instruction (e.g. 'Make it more intense', 'Change angle to wide shot')"
                            className="flex-grow bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            autoFocus
                        />
                        <button onClick={handleRefineSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">Apply</button>
                        </div>
                    </div>
                )}

                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    className="flex-grow min-h-[140px] bg-transparent text-gray-300 rounded-lg border border-transparent hover:border-gray-700 focus:border-indigo-500/50 focus:bg-gray-900 focus:ring-0 p-3 resize-none text-sm leading-relaxed font-mono custom-scrollbar placeholder-gray-700 transition-colors"
                    placeholder="Describe the visual scene and action..."
                />

                {/* Action Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800/50 opacity-100 sm:opacity-40 group-hover/card:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                        <button onClick={() => setIsRefining(!isRefining)} className={`w-7 h-7 rounded hover:bg-gray-700 flex items-center justify-center transition-colors ${isRefining ? 'text-indigo-400 bg-gray-700' : 'text-gray-500 hover:text-white'}`} title="AI Rewrite"><i className="fa-solid fa-wand-magic-sparkles text-xs"></i></button>
                        <button onClick={handleCopy} className="w-7 h-7 rounded hover:bg-gray-700 text-gray-500 hover:text-white flex items-center justify-center transition-colors" title="Copy Text">{copySuccess ? <i className="fa-solid fa-check text-green-500 text-xs"></i> : <i className="fa-regular fa-copy text-xs"></i>}</button>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="w-7 h-7 rounded hover:bg-gray-700 disabled:opacity-20 text-gray-500 hover:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-chevron-up text-xs"></i></button>
                        <button onClick={() => onMove(index, 'down')} disabled={index === totalPrompts - 1} className="w-7 h-7 rounded hover:bg-gray-700 disabled:opacity-20 text-gray-500 hover:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-chevron-down text-xs"></i></button>
                        <button onClick={() => onInsert(index, 'after')} className="w-7 h-7 rounded hover:bg-gray-700 text-gray-500 hover:text-white flex items-center justify-center transition-colors" title="Insert New Scene Below"><i className="fa-solid fa-plus text-xs"></i></button>
                        <button onClick={() => onDelete(prompt.id)} className="w-7 h-7 rounded hover:bg-red-900/30 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors" title="Delete Scene"><i className="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div>
            </div>

            {/* Visual Output Area */}
            <div className="w-full sm:w-[280px] bg-black/30 border-t sm:border-t-0 sm:border-l border-gray-700 p-3 flex flex-col gap-2">
                <div className="aspect-video bg-gray-900 rounded border border-gray-800 overflow-hidden relative group/image shadow-inner">
                    {isGenerating ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10">
                            <div className="w-6 h-6 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                            <span className="text-[9px] font-bold text-indigo-400 animate-pulse tracking-widest">RENDERING</span>
                        </div>
                    ) : null}

                    {generationState.imageUrl ? (
                        <>
                            <img 
                            src={`data:image/png;base64,${generationState.imageUrl}`} 
                            alt="Generated" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105 cursor-zoom-in"
                            onClick={() => onViewImage(generationState.imageUrl!)}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-white font-mono opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
                                4K • 16:9
                            </div>
                        </>
                    ) : hasError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl mb-1"></i>
                            <span className="text-[9px] text-red-400 font-mono leading-tight">{generationState.error}</span>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                            <i className="fa-solid fa-film text-3xl"></i>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => onGenerate(prompt.id)} 
                    disabled={isGenerating}
                    className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 border
                        ${isGenerating ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white border-gray-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'}`}
                >
                    {isGenerating ? 'Busy' : (
                        <>{hasImage ? <i className="fa-solid fa-rotate-right"></i> : <i className="fa-solid fa-camera"></i>} {hasImage ? 'Re-Shoot' : 'Generate'}</>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};

export default React.memo(PromptCard);
