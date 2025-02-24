import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { QueuePage } from './pages/QueuePage';
import { ProfilePage } from './pages/ProfilePage';
import { FindTeamPage } from './pages/FindTeamPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SupportPage } from './pages/SupportPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        user={user}
        onSignOut={signOut}
      />
      
      <Routes>
        <Route path="/" element={<QueuePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/team" element={<FindTeamPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-red-500">MARVEL</span>
              <span className="text-xl font-bold text-blue-500">RIVALS</span>
              <span className="text-lg font-semibold text-gray-400">QUEUE</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a href="/terms" className="hover:text-white transition">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
              <a href="/support" className="hover:text-white transition">Support & FAQ</a>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Marvel Rivals Queue. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;