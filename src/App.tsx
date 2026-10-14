/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { ClassesView } from './components/ClassesView';
import { StudentsView } from './components/StudentsView';
import { ProgressView } from './components/ProgressView';
import { AttendanceView } from './components/AttendanceView';
import { ToastContainer } from './components/Toast';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { BackupModal } from './components/BackupModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Header */}
      <Header
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex min-w-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'classes' && <ClassesView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'progress' && <ProgressView />}
          {activeTab === 'attendance' && <AttendanceView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <StudentProfileModal />
      <ClassDetailModal />
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
