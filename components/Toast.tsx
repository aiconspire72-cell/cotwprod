
import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for animation
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const bgColors = {
    info: 'bg-gray-800 border-gray-600',
    success: 'bg-green-900/90 border-green-500',
    error: 'bg-red-900/90 border-red-500',
    warning: 'bg-yellow-900/90 border-yellow-500'
  };

  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    error: 'fa-triangle-exclamation',
    warning: 'fa-bolt'
  };

  return (
    <div 
      className={`pointer-events-auto min-w-[300px] max-w-sm border shadow-xl rounded-lg p-4 flex items-center gap-3 text-white transform transition-all duration-300 ${bgColors[toast.type]} ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
    >
      <i className={`fa-solid ${icons[toast.type]} text-lg`}></i>
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={() => { setIsExiting(true); setTimeout(() => onRemove(toast.id), 300); }} className="ml-auto text-white/50 hover:text-white">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default ToastContainer;
