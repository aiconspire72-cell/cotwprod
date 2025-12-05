
import React, { useState, useRef } from 'react';
import FileSaver from 'file-saver';
import { Preset, ReferenceMap, ReferenceData } from '../types';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  currentCharacters: ReferenceMap;
  currentLocations: ReferenceMap;
  onSave: (name: string) => void;
  onLoad: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onImport: (preset: Preset) => void;
}

const PresetModal: React.FC<PresetModalProps> = ({ 
  isOpen, 
  onClose, 
  presets, 
  currentCharacters, 
  currentLocations, 
  onSave, 
  onLoad, 
  onDelete,
  onImport
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    onSave(newPresetName);
    setNewPresetName('');
  };

  const handleExportFile = (preset: Preset) => {
      const blob = new Blob([JSON.stringify(preset, null, 2)], {type: "application/json"});
      const filename = `Sora2_Preset_${preset.name.replace(/\s+/g, '_')}.json`;
      FileSaver.saveAs(blob, filename);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = event.target?.result as string;
              const preset = JSON.parse(json);
              
              // Robust structure check
              if (preset.name && typeof preset.characters === 'object' && typeof preset.locations === 'object') {
                  onImport(preset);
              } else {
                  alert("Invalid preset file structure. Missing 'name', 'characters', or 'locations'.");
              }
          } catch (err) {
              console.error(err);
              alert("Failed to parse preset file. Ensure it is valid JSON.");
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString();
  };

  const refCount = (p: Preset) => Object.keys(p.characters).length + Object.keys(p.locations).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900 border border-cyan-500/50 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-cyan-900/30 to-gray-900">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <i className="fa-solid fa-box-archive text-cyan-400"></i>
               Reference Presets
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white">
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          <p className="text-xs text-cyan-300/70 mt-1">
            Save, Export, or Import your character/location setups.
          </p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            
            {/* Action Bar: Save & Import */}
            <div className="flex flex-col gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-bold text-white mb-3">Save Current Setup</h4>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="e.g. Destiny Cup Cast (Full)"
                            className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                        <button 
                            onClick={handleSave}
                            disabled={!newPresetName.trim()}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Save
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        Includes {Object.keys(currentCharacters).length} Characters and {Object.keys(currentLocations).length} Locations.
                    </p>
                </div>

                <div className="flex justify-end">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-bold rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
                    >
                        <i className="fa-solid fa-file-import"></i> Import from File
                    </button>
                </div>
            </div>

            {/* Existing Presets List */}
            <div>
                <h4 className="text-sm font-bold text-white mb-3">Saved Presets</h4>
                {presets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-800 rounded-lg">
                        No presets saved yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {presets.map(preset => (
                            <div key={preset.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-600 transition-colors">
                                <div className="flex-grow">
                                    <div className="font-bold text-white text-sm">{preset.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {refCount(preset)} references • {formatDate(preset.createdAt)}
                                    </div>
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {(Object.values(preset.characters) as ReferenceData[]).slice(0, 5).map(c => (
                                            <span key={c.id} className="px-1.5 py-0.5 bg-pink-900/30 text-pink-400 text-[10px] rounded border border-pink-500/20">{c.name}</span>
                                        ))}
                                        {Object.values(preset.characters).length > 5 && <span className="text-[10px] text-gray-500">...</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button 
                                        onClick={() => handleExportFile(preset)}
                                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs font-bold rounded transition-colors flex items-center gap-2"
                                        title="Export to JSON"
                                    >
                                        <i className="fa-solid fa-download"></i> Export
                                    </button>
                                    <button 
                                        onClick={() => onLoad(preset)}
                                        className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors flex items-center gap-2"
                                        title="Load this preset"
                                    >
                                        <i className="fa-solid fa-upload"></i> Load
                                    </button>
                                    <button 
                                        onClick={() => onDelete(preset.id)}
                                        className="w-8 h-8 rounded-full hover:bg-red-900/50 text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center"
                                        title="Delete Preset"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-850 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
                Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default PresetModal;
