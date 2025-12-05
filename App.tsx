
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { INITIAL_PROMPTS, INITIAL_CHARACTERS, INITIAL_LOCATIONS, INITIAL_LORE } from './constants';
import { PromptData, ReferenceMap, GenerationMap, ReferenceData, GenerationResult, ReferenceType, Preset } from './types';
import ReferenceSlot from './components/ReferenceSlot';
import PromptCard from './components/PromptCard';
import ImportModal from './components/ImportModal';
import AddReferenceModal from './components/AddReferenceModal';
import EpisodeGeneratorModal from './components/EpisodeGeneratorModal';
import LoreModal from './components/LoreModal';
import PresetModal from './components/PresetModal';
import ToastContainer, { ToastMessage } from './components/Toast';
import Lightbox from './components/Lightbox';
import { saveToDB, loadFromDB, clearDB } from './services/storageService';
import { parseScript, enhancePrompt, sanitizePrompt, getReferencedIds, reindexPrompts, toggleNoMusicTag } from './services/textService';
import { generateAnimeFrame, refineTextPrompt, generateNextBeat, generateScriptFromIdea, breakScriptDown } from './services/geminiService';

// Storage Keys
const STORAGE_KEYS = {
  CHARACTERS: 'sora2_characters_v1',
  LOCATIONS: 'sora2_locations_v1',
  PROMPTS: 'sora2_prompts_v1',
  GENERATIONS: 'sora2_generations_v1',
  LORE: 'sora2_lore_v1',
  PRESETS: 'sora2_presets_v1'
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  // --- State ---
  const [characters, setCharacters] = useState<ReferenceMap>(INITIAL_CHARACTERS);
  const [locations, setLocations] = useState<ReferenceMap>(INITIAL_LOCATIONS);
  const [prompts, setPrompts] = useState<PromptData[]>(INITIAL_PROMPTS);
  const [lore, setLore] = useState<string>(INITIAL_LORE);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [generationStates, setGenerationStates] = useState<GenerationMap>({});
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddRefModalOpen, setIsAddRefModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'characters' | 'locations'>('characters');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Settings State
  const [noMusicMode, setNoMusicMode] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [styleMode, setStyleMode] = useState<'anime' | 'aaa' | 'pixar'>('anime');

  // Generation Control
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0); 
  const stopBatchRef = useRef(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [isGeneratingNextBeat, setIsGeneratingNextBeat] = useState(false);

  // Memoize active list to prevent calculation on every render
  const allReferences = useMemo(() => ({ ...characters, ...locations }), [characters, locations]);
  const activeList = activeTab === 'characters' ? characters : locations;

  // --- Toast Helpers ---
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 4000) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Persistence Effects ---
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const [savedChars, savedLocs, savedPrompts, savedGens, savedLore, savedPresets] = await Promise.all([
          loadFromDB<ReferenceMap>(STORAGE_KEYS.CHARACTERS),
          loadFromDB<ReferenceMap>(STORAGE_KEYS.LOCATIONS),
          loadFromDB<PromptData[]>(STORAGE_KEYS.PROMPTS),
          loadFromDB<GenerationMap>(STORAGE_KEYS.GENERATIONS),
          loadFromDB<string>(STORAGE_KEYS.LORE),
          loadFromDB<Preset[]>(STORAGE_KEYS.PRESETS)
        ]);

        if (savedChars) setCharacters(savedChars);
        if (savedLocs) setLocations(savedLocs);
        if (savedPrompts) setPrompts(savedPrompts);
        if (savedGens) setGenerationStates(savedGens);
        if (savedLore) setLore(savedLore);
        if (savedPresets) setPresets(savedPresets);
      } catch (e) {
        console.error("Failed to hydrate state from DB", e);
      } finally {
        setIsLoaded(true);
      }
    };
    hydrateState();
  }, []);

  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.CHARACTERS, characters); }, [characters, isLoaded]);
  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.LOCATIONS, locations); }, [locations, isLoaded]);
  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.PROMPTS, prompts); }, [prompts, isLoaded]);
  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.GENERATIONS, generationStates); }, [generationStates, isLoaded]);
  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.LORE, lore); }, [lore, isLoaded]);
  useEffect(() => { if (isLoaded) saveToDB(STORAGE_KEYS.PRESETS, presets); }, [presets, isLoaded]);

  // --- Handlers ---

  const handleToggleNoMusic = () => {
      const newState = !noMusicMode;
      setNoMusicMode(newState);
      setPrompts(prev => prev.map(p => ({
          ...p,
          content: toggleNoMusicTag(p.content, newState)
      })));
      addToast(newState ? "No Music Mode Enabled" : "No Music Mode Disabled", 'info');
  };

  const handleToggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
    addToast(!voiceMode ? "Voice Tags Enabled (Next script gen)" : "Voice Tags Disabled", 'info');
  };

  const handleToggleStyleMode = () => {
    let newMode: 'anime' | 'aaa' | 'pixar' = 'anime';
    let label = "Anime";
    
    if (styleMode === 'anime') { newMode = 'aaa'; label = "AAA Cinematic"; }
    else if (styleMode === 'aaa') { newMode = 'pixar'; label = "Pixar 3D"; }
    else { newMode = 'anime'; label = "Anime"; }

    setStyleMode(newMode);
    addToast(`Switched to ${label} Mode`, 'info');
  };

  const handleReferenceUpload = useCallback((id: string, base64: string, mimeType: string) => {
    if (characters[id]) setCharacters(prev => ({ ...prev, [id]: { ...prev[id], base64, mimeType } }));
    else if (locations[id]) setLocations(prev => ({ ...prev, [id]: { ...prev[id], base64, mimeType } }));
    addToast("Reference image updated!", 'success');
  }, [characters, locations, addToast]);

  const handleAddReference = (type: ReferenceType, id: string, name: string, description: string, color: string, voice: string) => {
    const newRef: ReferenceData = { id, name, description, color, type, voice: voice || null, base64: null, mimeType: null };
    if (type === 'character') setCharacters(prev => ({ ...prev, [id]: newRef }));
    else setLocations(prev => ({ ...prev, [id]: newRef }));
    setActiveTab(type === 'character' ? 'characters' : 'locations');
    addToast(`Added new ${type}: ${name}`, 'success');
  };

  const handleDeleteReference = useCallback((id: string) => {
    if (window.confirm(`Delete reference @${id}?`)) {
      setCharacters(prev => { 
          if (prev[id]) { const n = { ...prev }; delete n[id]; return n; }
          return prev;
      });
      setLocations(prev => { 
          if (prev[id]) { const n = { ...prev }; delete n[id]; return n; }
          return prev;
      });
      addToast("Reference deleted", 'info');
    }
  }, [addToast]);

  const handlePromptUpdate = useCallback((id: string, newContent: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
  }, []);

  const handleDeletePrompt = useCallback((id: string) => {
    if (window.confirm("Delete this scene card?")) {
      setPrompts((currentPrompts: PromptData[]) => {
          const remaining = currentPrompts.filter((p: PromptData) => p.id !== id);
          const reindexed = reindexPrompts(remaining);
          setGenerationStates(currentGenStates => {
              const newGenStates: GenerationMap = {};
              reindexed.forEach((newP, idx) => {
                  const originalPrompt = remaining[idx];
                  if (originalPrompt) {
                      const oldState = currentGenStates[originalPrompt.id];
                      if (oldState) newGenStates[newP.id] = oldState;
                  }
              });
              return newGenStates;
          });
          return reindexed;
      });
      addToast("Scene deleted", 'info');
    }
  }, [addToast]);

  const handleMovePrompt = useCallback((index: number, direction: 'up' | 'down') => {
    setPrompts(currentPrompts => {
        if (direction === 'up' && index === 0) return currentPrompts;
        if (direction === 'down' && index === currentPrompts.length - 1) return currentPrompts;

        const newPrompts = [...currentPrompts];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newPrompts[index], newPrompts[targetIndex]] = [newPrompts[targetIndex], newPrompts[index]];
        
        const id1 = currentPrompts[index].id;
        const id2 = currentPrompts[targetIndex].id;
        
        const reindexed = reindexPrompts(newPrompts);
        
        setGenerationStates(prev => {
            const newGenStates = { ...prev };
            const state1 = newGenStates[id1];
            const state2 = newGenStates[id2];
            newGenStates[id1] = state2;
            newGenStates[id2] = state1;
            return newGenStates;
        });

        return reindexed;
    });
  }, []);
  
  const handleInsertPrompt = useCallback((index: number, position: 'before' | 'after') => {
    setPrompts(currentPrompts => {
        const newIndex = position === 'before' ? index : index + 1;
        const placeholderContent = `Sequence X: [New Scene]\nPrompt: ADD SHONEN ANIME, 4K, [Describe scene here]\nChronological Flow:\n(Action) ...`;
        const finalContent = enhancePrompt(placeholderContent, [], allReferences, styleMode);
        const finalText = toggleNoMusicTag(finalContent, noMusicMode);
        const placeholder: PromptData = { id: "temp", time: "", characters: [], content: finalText };
        const newPrompts = [...currentPrompts];
        newPrompts.splice(newIndex, 0, placeholder);
        
        const reindexed = reindexPrompts(newPrompts);
        
        setGenerationStates(prev => {
            const migratedGenStates: GenerationMap = {};
            reindexed.forEach((p, idx) => {
                if (idx < newIndex) {
                    const oldId = (idx + 1).toString().padStart(2, '0');
                    migratedGenStates[oldId] = prev[oldId];
                } else if (idx === newIndex) {
                    const newId = (idx + 1).toString().padStart(2, '0');
                    migratedGenStates[newId] = { imageUrl: null, loading: false, error: null };
                } else {
                    const oldId = idx.toString().padStart(2, '0');
                    const newId = (idx + 1).toString().padStart(2, '0');
                    migratedGenStates[newId] = prev[oldId];
                }
            });
            return migratedGenStates;
        });

        return reindexed;
    });
    addToast("New scene inserted", 'success');
  }, [allReferences, styleMode, noMusicMode, addToast]);

  const updateGenState = useCallback((id: string, update: Partial<typeof generationStates[string]>) => {
    setGenerationStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { imageUrl: null, loading: false, error: null }), ...update }
    }));
  }, []);

  const handleRefinePrompt = useCallback(async (id: string, instruction: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    updateGenState(id, { loading: true, error: null });
    try {
      const refinedText = await refineTextPrompt(prompt.content, instruction);
      const finalText = toggleNoMusicTag(refinedText, noMusicMode);
      handlePromptUpdate(id, finalText);
      updateGenState(id, { loading: false });
      addToast("Prompt refined!", 'success');
    } catch (err: any) {
      updateGenState(id, { loading: false, error: "Refine failed: " + err.message });
      addToast("Failed to refine prompt", 'error');
    }
  }, [prompts, noMusicMode, handlePromptUpdate, updateGenState, addToast]);

  const performGeneration = useCallback(async (id: string): Promise<{ success: boolean; isRateLimit: boolean }> => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return { success: false, isRateLimit: false };

    updateGenState(id, { loading: true, error: null });

    try {
      const referencedIds = getReferencedIds(prompt.content, allReferences);
      const enhancedText = enhancePrompt(prompt.content, referencedIds, allReferences, styleMode);
      const sanitizedText = sanitizePrompt(enhancedText);
      const base64 = await generateAnimeFrame(sanitizedText, referencedIds, allReferences, styleMode);
      
      updateGenState(id, { loading: false, imageUrl: base64 });
      return { success: true, isRateLimit: false };
      
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      const code = err.error?.code || err.code;
      const isRateLimit = err.isRateLimit || code === 429 || code === 503 || msg.includes("429") || msg.includes("quota") || msg.includes("exhausted") || msg.includes("unavailable") || msg.includes("overloaded");
      const errorMsg = isRateLimit ? "Service Busy/Rate Limit. Waiting..." : (err.message || "Unknown error");
      updateGenState(id, { loading: false, error: errorMsg });
      return { success: false, isRateLimit };
    }
  }, [prompts, allReferences, styleMode, updateGenState]);

  const handlePieceByPiece = async () => {
    if (isGeneratingNextBeat) return;
    setIsGeneratingNextBeat(true);
    addToast("Dreaming up next beat...", 'info');

    try {
        const lastPrompt = prompts.length > 0 ? prompts[prompts.length - 1] : null;
        const lastId = lastPrompt ? parseInt(lastPrompt.id) : 0;
        const lastContent = lastPrompt ? lastPrompt.content : null;
        const startTime = prompts.length * 15;

        const nextScript = await generateNextBeat(lastId, lastContent, allReferences, voiceMode, lore, styleMode);
        const rawPrompts = parseScript(nextScript, allReferences, lastId, startTime);
        const newPrompts = rawPrompts.map(p => ({
            ...p,
            content: toggleNoMusicTag(p.content, noMusicMode)
        }));
        
        if (newPrompts.length > 0) {
            setPrompts(prev => [...prev, ...newPrompts]);
            addToast("Next beat added!", 'success');
            // Scroll to new
            setTimeout(() => {
                const element = document.getElementById(`prompt-card-${newPrompts[0].id}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            addToast("AI response was empty. Try again.", 'warning');
        }

    } catch (error: any) {
        addToast("Failed to generate next beat", 'error');
    } finally {
        setIsGeneratingNextBeat(false);
    }
  };

  const handleGenerateAll = async () => {
    if (isBatchGenerating) return; 
    setIsBatchGenerating(true);
    stopBatchRef.current = false;
    const promptIds = prompts.map((p: PromptData) => p.id);
    setBatchProgress({ current: 0, total: promptIds.length });
    addToast("Starting batch generation...", 'info');

    let i = 0;
    while (i < promptIds.length) {
      if (stopBatchRef.current) {
        addToast("Batch generation stopped", 'warning');
        break;
      }
      const id = promptIds[i];
      setBatchProgress({ current: i + 1, total: promptIds.length });
      
      const element = document.getElementById(`prompt-card-${id}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      let success = false;
      while (!success && !stopBatchRef.current) {
         const result = await performGeneration(id);
         if (result.success) {
            success = true;
            await wait(2000); 
         } else if (result.isRateLimit) {
            const cooldown = 60;
            setCooldownSeconds(cooldown);
            addToast(`Rate limit hit! Cooling down...`, 'warning', cooldown * 1000);
            for (let c = cooldown; c > 0; c--) {
                if (stopBatchRef.current) break;
                setCooldownSeconds(c);
                await wait(1000);
            }
            setCooldownSeconds(0);
         } else {
             addToast(`Skipping scene ${id} due to error`, 'error');
             success = true;
             await wait(1000);
         }
      }
      i++;
    }
    setIsBatchGenerating(false);
    setBatchProgress({ current: 0, total: 0 });
    if (!stopBatchRef.current) addToast("Batch generation complete!", 'success');
  };

  const handleStopBatch = () => stopBatchRef.current = true;

  const handleResetProject = async () => {
    if (window.confirm("Reset to default project?")) {
      await clearDB();
      window.location.reload();
    }
  };

  const handleCleanSlate = async () => {
    if (window.confirm("Clean Slate? This will REMOVE ALL sequences, characters, and locations.")) {
        setPrompts([]);
        setCharacters({});
        setLocations({});
        setGenerationStates({});
        await clearDB();
        addToast("Project wiped clean.", 'success');
    }
  };

  const handleSavePreset = (name: string) => {
    const newPreset: Preset = {
        id: Date.now().toString(),
        name,
        characters,
        locations,
        createdAt: Date.now()
    };
    setPresets(prev => [newPreset, ...prev]);
    addToast("Setup saved as preset!", 'success');
  };

  const handleLoadPreset = (preset: Preset) => {
    if (window.confirm(`Load preset '${preset.name}'?`)) {
        setCharacters(preset.characters);
        setLocations(preset.locations);
        setIsPresetModalOpen(false);
        addToast("Preset loaded successfully!", 'success');
    }
  };

  const handleImportPresetFromFile = (preset: Preset) => {
      // Robust validation
      if (!preset.name || typeof preset.characters !== 'object' || typeof preset.locations !== 'object') {
          addToast("Invalid preset file format.", 'error');
          return;
      }
      
      // Assign new unique ID to avoid collisions with existing presets or re-imports of same file
      const importedPreset: Preset = {
          ...preset,
          id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setPresets(prev => [importedPreset, ...prev]);
      addToast(`Imported preset: ${preset.name}`, 'success');
  };

  const handleDeletePreset = (id: string) => {
      if (window.confirm("Delete this preset?")) {
          setPresets((prev: Preset[]) => prev.filter((p: Preset) => p.id !== id));
          addToast("Preset deleted.", 'info');
      }
  };

  const handleImportScript = (text: string, append: boolean) => {
    let newPrompts: PromptData[] = [];
    if (append) {
      const lastId = prompts.length > 0 ? parseInt(prompts[prompts.length - 1].id) : 0;
      const startTime = prompts.length * 15;
      const raw = parseScript(text, allReferences, lastId, startTime);
      newPrompts = raw.map(p => ({ ...p, content: toggleNoMusicTag(p.content, noMusicMode) }));
      setPrompts(prev => [...prev, ...newPrompts]);
    } else {
      setGenerationStates({});
      const raw = parseScript(text, allReferences, 0, 0);
      newPrompts = raw.map(p => ({ ...p, content: toggleNoMusicTag(p.content, noMusicMode) }));
      setPrompts(newPrompts);
    }
    if (newPrompts.length === 0) addToast("No scenes detected.", 'warning');
    else addToast(`Imported ${newPrompts.length} scenes`, 'success');
  };

  const handleExportZip = async () => {
    addToast("Preparing export...", 'info');
    const zip = new JSZip();
    const folder = zip.folder("Sora2_Project");
    if (!folder) return;

    const refsFolder = folder.folder("references");
    Object.values(allReferences).forEach((ref: ReferenceData) => {
      if (ref.base64 && refsFolder) {
        let ext = ref.mimeType === 'image/jpeg' ? 'jpg' : 'png';
        refsFolder.file(`${ref.type}_${ref.id}.${ext}`, ref.base64, { base64: true });
      }
    });

    prompts.forEach(p => {
      folder.file(`${p.id}.txt`, p.content);
      const genState = generationStates[p.id];
      if (genState?.imageUrl) folder.file(`${p.id}.png`, genState.imageUrl, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, "Sora2_Anime_Project.zip");
    addToast("Export started!", 'success');
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Engine...</div>;

  let styleIcon = "fa-paintbrush";
  if (styleMode === 'aaa') styleIcon = "fa-clapperboard";
  if (styleMode === 'pixar') styleIcon = "fa-cubes";

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-gray-100 overflow-hidden">
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {lightboxUrl && <Lightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportScript} characters={characters} />
      <AddReferenceModal isOpen={isAddRefModalOpen} onClose={() => setIsAddRefModalOpen(false)} onAdd={handleAddReference} />
      <PresetModal isOpen={isPresetModalOpen} onClose={() => setIsPresetModalOpen(false)} presets={presets} currentCharacters={characters} currentLocations={locations} onSave={handleSavePreset} onLoad={handleLoadPreset} onDelete={handleDeletePreset} onImport={handleImportPresetFromFile} />
      <EpisodeGeneratorModal isOpen={isEpisodeModalOpen} onClose={() => setIsEpisodeModalOpen(false)} onImport={handleImportScript} references={allReferences} />
      <LoreModal isOpen={isLoreModalOpen} onClose={() => setIsLoreModalOpen(false)} lore={lore} onSave={(newLore) => { setLore(newLore); addToast("Lore Updated", 'success'); }} />

      {/* --- SIDEBAR --- */}
      <aside className={`flex-shrink-0 bg-[#151921] border-r border-gray-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
          {/* Sidebar Toggle */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              {isSidebarOpen && <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Assets</h2>}
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-white transition-colors">
                  <i className={`fa-solid ${isSidebarOpen ? 'fa-angles-left' : 'fa-angles-right'}`}></i>
              </button>
          </div>

          {/* Sidebar Content */}
          {isSidebarOpen && (
              <div className="flex-grow flex flex-col min-h-0">
                  {/* Asset Tabs */}
                  <div className="flex p-2 bg-gray-900/50 mx-4 mt-4 rounded-lg border border-gray-800">
                      <button onClick={() => setActiveTab('characters')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'characters' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                          Characters
                      </button>
                      <button onClick={() => setActiveTab('locations')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'locations' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                          Locations
                      </button>
                  </div>

                  {/* Asset List */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {Object.values(activeList).map(ref => (
                          <ReferenceSlot key={ref.id} data={ref} onUpload={handleReferenceUpload} onDelete={handleDeleteReference} />
                      ))}
                      <button onClick={() => setIsAddRefModalOpen(true)} className="w-full py-3 border-2 border-dashed border-gray-800 rounded-lg text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-colors text-xs font-bold flex items-center justify-center gap-2">
                          <i className="fa-solid fa-plus"></i> Add New
                      </button>
                  </div>

                  {/* Sidebar Footer Actions */}
                  <div className="p-4 border-t border-gray-800 bg-gray-900/50 space-y-2">
                      <button onClick={() => setIsLoreModalOpen(true)} className="w-full py-2 bg-yellow-900/20 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-900/40 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                          <i className="fa-solid fa-book-journal-whills"></i> World Lore
                      </button>
                      <button onClick={() => setIsPresetModalOpen(true)} className="w-full py-2 bg-cyan-900/20 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-900/40 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                          <i className="fa-solid fa-box-archive"></i> Presets
                      </button>
                  </div>
              </div>
          )}
          
          {/* Collapsed View Icons */}
          {!isSidebarOpen && (
              <div className="flex flex-col items-center py-4 gap-4">
                  <button onClick={() => { setIsSidebarOpen(true); setActiveTab('characters'); }} className="w-10 h-10 rounded-lg bg-pink-900/20 text-pink-500 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors" title="Characters"><i className="fa-solid fa-user"></i></button>
                  <button onClick={() => { setIsSidebarOpen(true); setActiveTab('locations'); }} className="w-10 h-10 rounded-lg bg-green-900/20 text-green-500 hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors" title="Locations"><i className="fa-solid fa-map"></i></button>
                  <div className="h-px w-8 bg-gray-800"></div>
                  <button onClick={() => setIsLoreModalOpen(true)} className="w-10 h-10 rounded-lg bg-yellow-900/20 text-yellow-500 hover:bg-yellow-600 hover:text-white flex items-center justify-center transition-colors" title="Lore"><i className="fa-solid fa-book"></i></button>
              </div>
          )}
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex flex-col h-full relative overflow-hidden">
          
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center z-20 shadow-md">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-dragon text-white text-sm"></i>
                  </div>
                  <h1 className="font-bold text-lg text-white">Sora 2 <span className="font-light text-gray-400">Master Tool</span></h1>
              </div>

              {/* Global Settings Group */}
              <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
                  <button onClick={handleToggleStyleMode} className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all ${styleMode === 'anime' ? 'bg-pink-600 text-white' : styleMode === 'aaa' ? 'bg-cyan-600 text-white' : 'bg-orange-600 text-white'}`}>
                      <i className={`fa-solid ${styleIcon}`}></i> {styleMode.toUpperCase()}
                  </button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button onClick={handleToggleNoMusic} className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${noMusicMode ? 'text-red-400 bg-red-900/20' : 'text-gray-400 hover:text-white'}`} title="No Music Mode"><i className={`fa-solid ${noMusicMode ? 'fa-volume-xmark' : 'fa-music'}`}></i></button>
                  <button onClick={handleToggleVoiceMode} className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${voiceMode ? 'text-indigo-400 bg-indigo-900/20' : 'text-gray-400 hover:text-white'}`} title="Voice Tags"><i className={`fa-solid ${voiceMode ? 'fa-microphone' : 'fa-microphone-slash'}`}></i></button>
              </div>

              {/* Output Actions */}
              <div className="flex items-center gap-3">
                  {isBatchGenerating ? (
                      <div className="flex items-center gap-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-indigo-300 font-mono">{batchProgress.current}/{batchProgress.total}</span>
                          {cooldownSeconds > 0 && <span className="text-[10px] text-yellow-400 font-bold animate-pulse">{cooldownSeconds}s</span>}
                          <button onClick={handleStopBatch} className="text-red-400 hover:text-white"><i className="fa-solid fa-stop"></i></button>
                      </div>
                  ) : (
                      <button onClick={handleGenerateAll} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                          <i className="fa-solid fa-play"></i> Generate All
                      </button>
                  )}
                  <button onClick={handleExportZip} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors" title="Export Zip"><i className="fa-solid fa-download"></i></button>
                  <button onClick={handleCleanSlate} className="text-gray-600 hover:text-red-400 p-2 transition-colors" title="Clean Slate"><i className="fa-solid fa-trash"></i></button>
              </div>
          </header>

          {/* Main Storyboard Area */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-8 custom-scrollbar relative bg-[#0f1115]">
              
              {/* Storyboard Toolbar */}
              <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center sticky top-0 z-10 bg-[#0f1115]/95 backdrop-blur py-2 border-b border-gray-800">
                  <div className="flex gap-2">
                      <button onClick={handlePieceByPiece} disabled={isGeneratingNextBeat} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                          {isGeneratingNextBeat ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-puzzle-piece"></i>} Next Beat
                      </button>
                      <button onClick={() => setIsEpisodeModalOpen(true)} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-yellow-500 hover:text-yellow-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                          <i className="fa-solid fa-bolt"></i> AI Episode
                      </button>
                  </div>
                  <button onClick={() => setIsImportModalOpen(true)} className="text-gray-500 hover:text-white text-xs font-bold flex items-center gap-2">
                      <i className="fa-solid fa-file-lines"></i> Script Editor
                  </button>
              </div>

              <div className="max-w-5xl mx-auto pb-20">
                  {prompts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                          <i className="fa-solid fa-film text-6xl text-gray-700 mb-4"></i>
                          <h3 className="text-xl font-bold text-gray-500">Empty Storyboard</h3>
                          <p className="text-sm text-gray-600 mt-2">Generate a beat or import a script to begin.</p>
                      </div>
                  ) : (
                      prompts.map((prompt, index) => (
                          <div id={`prompt-card-${prompt.id}`} key={prompt.id}>
                              <PromptCard 
                                  prompt={prompt}
                                  index={index}
                                  totalPrompts={prompts.length}
                                  characterMap={allReferences}
                                  generationState={generationStates[prompt.id] || { imageUrl: null, loading: false, error: null }}
                                  onUpdateContent={handlePromptUpdate}
                                  onGenerate={performGeneration}
                                  onRefine={handleRefinePrompt}
                                  onDelete={handleDeletePrompt}
                                  onViewImage={setLightboxUrl}
                                  onMove={handleMovePrompt}
                                  onInsert={handleInsertPrompt}
                              />
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default App;
