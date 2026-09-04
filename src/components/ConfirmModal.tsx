import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = onCancel || onClose || (() => {});
  const displayConfirm = confirmLabel || confirmText || 'Delete';
  const displayCancel = cancelLabel || cancelText || 'Cancel';

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div
        id="confirm-modal-card"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95"
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 pr-6">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message}</p>
            </div>

            <button
              id="confirm-modal-close-btn"
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              id="confirm-modal-cancel-btn"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {displayCancel}
            </button>
            <button
              id="confirm-modal-action-btn"
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
                  <span>{displayConfirm}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
