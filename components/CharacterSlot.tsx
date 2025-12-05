
import React, { useRef, useState } from 'react';
import { CharacterData } from '../types';
import { resizeImage } from '../services/imageService';

interface CharacterSlotProps {
  character: CharacterData;
  onUpload: (id: string, base64: string, mimeType: string) => void;
}

const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setProcessing(true);
        // Resize to max 1024px to save memory and token/payload size
        const { base64, mimeType } = await resizeImage(file, 1024);
        onUpload(character.id, base64, mimeType);
      } catch (err) {
        console.error("Failed to process image", err);
        alert("Failed to load image. Please try a different file.");
      } finally {
        setProcessing(false);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!processing) {
      fileInputRef.current?.click();
    }
  };

  const imageSrc = character.base64 
    ? `data:${character.mimeType || 'image/png'};base64,${character.base64}`
    : '';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-pink-500/50 transition-colors duration-200">
      <div className="flex items-start gap-3 mb-2">
        <div 
          onClick={handleClick}
          className={`w-16 h-16 rounded-lg bg-gray-900 border-2 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 relative group
            ${character.base64 ? 'border-green-500' : 'border-dashed border-gray-600 hover:border-pink-500'}
            ${processing ? 'opacity-50 cursor-wait' : ''}`}
        >
          {processing ? (
             <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          ) : character.base64 ? (
            <img 
              src={imageSrc} 
              alt={character.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 group-hover:text-pink-500">
               <i className="fa-solid fa-plus"></i>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate" style={{ color: character.color }}>@{character.id}</span>
          </div>
          <div className="text-xs text-gray-400 font-medium truncate">{character.name}</div>
          <div className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-3">{character.description}</div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      <div className="text-xs text-center mt-2 h-4">
        {processing ? (
          <span className="text-pink-400">Processing...</span>
        ) : character.base64 ? (
          <span className="text-green-500 font-semibold">✓ Loaded</span>
        ) : (
          <span className="text-gray-600 italic">No reference image</span>
        )}
      </div>
    </div>
  );
};

export default CharacterSlot;
