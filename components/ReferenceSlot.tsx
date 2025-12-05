
import React, { useRef, useState } from 'react';
import { ReferenceData } from '../types';
import { resizeImage } from '../services/imageService';

interface ReferenceSlotProps {
  data: ReferenceData;
  onUpload: (id: string, base64: string, mimeType: string) => void;
  onDelete?: (id: string) => void;
}

const ReferenceSlot: React.FC<ReferenceSlotProps> = ({ data, onUpload, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setProcessing(true);
        // Resize to max 1024px to save memory and token/payload size
        const { base64, mimeType } = await resizeImage(file, 1024);
        onUpload(data.id, base64, mimeType);
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

  const imageSrc = data.base64 
    ? `data:${data.mimeType || 'image/png'};base64,${data.base64}`
    : '';

  const isLocation = data.type === 'location';
  const accentColor = isLocation ? 'text-green-400 border-green-500/30 bg-green-900/10' : 'text-pink-400 border-pink-500/30 bg-pink-900/10';
  const hoverBorder = isLocation ? 'group-hover:border-green-500' : 'group-hover:border-pink-500';

  return (
    <div className="group relative flex items-center gap-3 p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-750 transition-all duration-200">
      
      {/* Image Thumbnail / Upload Trigger */}
      <div 
        onClick={handleClick}
        className={`w-10 h-10 flex-shrink-0 rounded-md bg-gray-900 border ${data.base64 ? 'border-transparent' : 'border-dashed border-gray-600'} ${hoverBorder} flex items-center justify-center overflow-hidden cursor-pointer transition-all relative`}
      >
        {processing ? (
           <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${isLocation ? 'border-green-500' : 'border-pink-500'}`}></div>
        ) : data.base64 ? (
          <img 
            src={imageSrc} 
            alt={data.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="text-gray-600 group-hover:text-gray-300 text-xs">
             <i className="fa-solid fa-plus"></i>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-grow min-w-0 flex flex-col">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-200 truncate">{data.name}</span>
            {data.base64 && <i className="fa-solid fa-circle-check text-[10px] text-green-500"></i>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[9px] font-mono opacity-70`}>@{data.id}</span>
        </div>
      </div>

      {/* Delete Action */}
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 rounded hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      )}

      {/* Tooltip for Description */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-48 bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none z-50 hidden md:block">
          <p className="font-bold mb-1" style={{color: data.color}}>{data.name}</p>
          <p className="leading-tight line-clamp-4 text-[10px] opacity-80">{data.description}</p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
    </div>
  );
};

export default React.memo(ReferenceSlot);
