import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';
import { BottomNav } from './components/BottomNav';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { CalendarView } from './components/CalendarView';
import { SettingsPage } from './components/SettingsPage';
import type { NavItem } from './components/BottomNav';

/**
 * Main App Component
 *
 * SubTrack - A subscription manager PWA with iOS-style design.
 * Features dark/light mode following device preference.
 */

type AppView = 'home' | 'calendar' | 'settings';

function AppContent() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Update modal state when AddModal changes
  useEffect(() => {
    setIsAnyModalOpen(isAddModalOpen);
  }, [isAddModalOpen]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Main Content Area */}
      <main className="max-w-lg mx-auto">
        {activeView === 'home' && <Dashboard onOpenSettings={() => setActiveView('settings')} onModalOpenChange={setIsAnyModalOpen} />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'settings' && <SettingsPage onBack={() => setActiveView('home')} />}
      </main>

      {/* Bottom Navigation - Hide when settings or any modal is open */}
      {activeView !== 'settings' && !isAnyModalOpen && (
        <BottomNav
          activeTab={activeView as NavItem}
          onTabChange={(tab) => {
            if (tab === 'add') {
              setIsAddModalOpen(true);
              setIsAnyModalOpen(true);
            } else {
              setActiveView(tab as AppView);
            }
          }}
        />
      )}

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsAnyModalOpen(false);
        }}
      />
    </div>
  );
}

/**
 * App Wrapper with Context Providers
 */
function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
