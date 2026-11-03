import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-xl transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidths[maxWidth]} bg-slate-950 rounded-[28px] shadow-[0_30px_90px_rgba(15,23,42,0.5)] border border-slate-800/90 transform transition-all duration-200 scale-100 my-8 ring-1 ring-electric-500/20`}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-t-[28px]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 pr-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-electric-500/40 bg-electric-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-electric-400">
                  Secure session
                </div>
                {title && (
                  <h3 className="text-xl font-black tracking-tight text-white">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm leading-6 text-slate-300">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {children && <div className="p-6 text-slate-200">{children}</div>}

        {footer && (
          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 rounded-b-[28px] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
