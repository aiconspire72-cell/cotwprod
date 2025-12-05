
import React, { useState } from 'react';
import { ReferenceType } from '../types';

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: ReferenceType, id: string, name: string, description: string, color: string, voice: string) => void;
}

const AddReferenceModal: React.FC<AddReferenceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<ReferenceType>('character');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [voice, setVoice] = useState('');
  const [color, setColor] = useState('#ec4899');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !handle || !description) return;
    
    // Ensure handle is clean
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
    onAdd(type, cleanHandle, name, description, color, voice);
    
    // Reset
    setName('');
    setHandle('');
    setDescription('');
    setVoice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Add New Reference</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle */}
          <div className="flex bg-gray-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('character')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${type === 'character' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Character
            </button>
            <button
              type="button"
              onClick={() => setType('location')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${type === 'location' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Location
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Display Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
              placeholder={type === 'character' ? "e.g. Goku" : "e.g. Training Dojo"}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Handle ID <span className="text-gray-600">(lowercase, unique)</span>
            </label>
            <div className="flex items-center">
               <span className="bg-gray-800 border border-r-0 border-gray-700 px-3 py-2 text-gray-400 rounded-l">@</span>
               <input 
                required
                type="text" 
                value={handle}
                onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="w-full bg-gray-800 border border-gray-700 rounded-r px-3 py-2 text-white focus:border-indigo-500 outline-none"
                placeholder={type === 'character' ? "goku" : "dojo"}
              />
            </div>
          </div>

          <div>
             <label className="block text-xs text-gray-400 mb-1">Visual Description <span className="text-gray-500">(Crucial for AI)</span></label>
             <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none resize-none"
                placeholder="Detailed visual description of appearance, clothes, colors..."
             ></textarea>
          </div>

          {type === 'character' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Voice Description <span className="text-gray-500">(Optional)</span></label>
              <input 
                type="text" 
                value={voice}
                onChange={e => setVoice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. Deep, gritty, high-energy shonen hero voice"
              />
            </div>
          )}

          <div>
             <label className="block text-xs text-gray-400 mb-1">Label Color</label>
             <input 
                type="color" 
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-8 bg-gray-800 rounded cursor-pointer"
             />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-2 rounded text-sm font-semibold text-gray-400 hover:bg-gray-800">Cancel</button>
             <button type="submit" className="flex-1 py-2 rounded text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white">Create</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddReferenceModal;
