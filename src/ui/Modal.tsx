import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-150" 
        onClick={onClose}
      />
      
      {/* Dialog Shell */}
      <div className={`relative w-full bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col max-h-[85vh] z-10 ${sizes[size]} animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50 rounded-t-lg">
          <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-700 text-xs leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-150 flex justify-end space-x-2 bg-slate-50/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
