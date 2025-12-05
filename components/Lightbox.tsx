import React, { useEffect } from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        title="Close (ESC)"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>

      <img 
        src={`data:image/png;base64,${imageUrl}`} 
        alt="Full size"
        className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg select-none"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono bg-black/50 px-3 py-1 rounded-full border border-white/10 pointer-events-none">
        ESC to close
      </div>
    </div>
  );
};

export default Lightbox;