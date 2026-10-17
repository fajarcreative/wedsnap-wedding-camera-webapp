import React, { Component, ErrorInfo, ReactNode } from 'react';
import { safeStorage } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WedSnap App ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    safeStorage.clearAll();
    window.location.href = window.location.origin + window.location.pathname;
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-[#775a19]/10 text-[#775a19] flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">refresh</span>
          </div>
          <h2 className="text-xl font-bold font-serif mb-2 text-[#775a19]">
            WedSnap Siap Digunakan
          </h2>
          <p className="text-sm text-gray-600 max-w-sm mb-6 leading-relaxed">
            Terjadi sedikit penyesuaian memori pada peramban perangkat Anda. Ketuk tombol di bawah untuk membuka kembali.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-[#775a19] text-white font-semibold text-sm shadow-md active:scale-95 transition-transform"
            >
              Buka Kembali
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-[#775a19]/30 text-[#775a19] font-medium text-xs hover:bg-[#775a19]/5"
            >
              Reset & Buka Baru
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

