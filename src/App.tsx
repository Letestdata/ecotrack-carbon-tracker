// ============================================================
// EcoTrack – Root App Component
// Google Cloud Console Deployment Ready
// ============================================================

import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { LogActivity } from './pages/LogActivity';
import { Insights } from './pages/Insights';
import { Tips } from './pages/Tips';
import { Assistant } from './pages/Assistant';
import { Profile } from './pages/Profile';

// ── Skip-to-content link (accessibility) ─────────────────────

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-medium focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

// ── Page router ───────────────────────────────────────────────

function PageRouter() {
  const { state } = useApp();
  const { currentPage } = state;

  switch (currentPage) {
    case 'dashboard': return <Dashboard />;
    case 'log':       return <LogActivity />;
    case 'insights':  return <Insights />;
    case 'tips':      return <Tips />;
    case 'assistant': return <Assistant />;
    case 'profile':   return <Profile />;
    default:          return <Dashboard />;
  }
}

// ── App layout ────────────────────────────────────────────────

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <SkipLink />
      <Navigation />

      {/* Desktop: offset for sidebar; Mobile: full width */}
      <div className="md:ml-64">
        <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-8">
          <PageRouter />
        </div>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
