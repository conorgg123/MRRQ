import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { SignUpModal } from './SignUpModal';

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1">
            <div className="flex items-baseline">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text transform -skew-x-6">
                MARVEL
              </span>
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text transform -skew-x-6 ml-1">
                RIVALS
              </span>
            </div>
            <div className="h-8 w-px bg-gray-700 mx-2 transform -skew-x-12"></div>
            <span className="text-xl font-bold text-gray-400 tracking-wide transform -skew-x-6 hover:text-gray-300 transition-colors">
              QUEUE
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition">Dashboard</Link>
            <Link to="/team" className="text-gray-300 hover:text-white transition">Find Team</Link>
            {user && (
              <Link to="/profile" className="text-gray-300 hover:text-white transition">Profile</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition">
              <Bell className="w-5 h-5" />
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
                >
                  <User className="w-5 h-5" />
                  <span>{user.username}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="text-gray-300 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowSignInModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignUpModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        message="Sign in to queue for matches and track your stats!"
      />
    </header>
  );
};