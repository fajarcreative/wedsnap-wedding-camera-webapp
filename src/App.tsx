import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { PolaroidModal } from './components/PolaroidModal';
import { SlideshowModal } from './components/SlideshowModal';
import { TableQRModal } from './components/TableQRModal';
import { CameraView } from './pages/CameraView';
import { ReviewView } from './pages/ReviewView';
import { GalleryView } from './pages/GalleryView';
import { DashboardView } from './pages/DashboardView';

export const AppContent: React.FC = () => {
  const { currentRoute } = useApp();

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Fixed Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col relative w-full ${
          currentRoute === 'camera'
            ? 'pt-16 pb-20 h-[100dvh] max-h-[100dvh] overflow-hidden'
            : 'pt-20 pb-28 min-h-screen'
        } bg-surface`}
      >
        {currentRoute === 'camera' && <CameraView />}
        {currentRoute === 'review' && <ReviewView />}
        {currentRoute === 'gallery' && <GalleryView />}
        {currentRoute === 'dashboard' && <DashboardView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Toast Feedback */}
      <Toast />

      {/* Global Modals */}
      <PolaroidModal />
      <SlideshowModal />
      <TableQRModal />
    </div>
  );
};

