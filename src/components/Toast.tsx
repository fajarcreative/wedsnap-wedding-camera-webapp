import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      role="alert"
      className={`fixed bottom-24 left-4 right-4 max-w-sm mx-auto p-3.5 rounded-xl shadow-xl flex items-center gap-2.5 z-50 transition-all transform animate-bounce-short ${
        isError
          ? 'bg-error text-on-error'
          : 'bg-primary text-on-primary'
      }`}
    >
      <span className="material-symbols-outlined text-[22px] flex-shrink-0">
        {toast.icon || 'info'}
      </span>
      <span className="font-body-sm text-body-sm flex-1 font-medium leading-snug">
        {toast.message}
      </span>
    </div>
  );
};

