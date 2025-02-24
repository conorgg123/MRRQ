import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Heart } from 'lucide-react';
import { SignUpModal } from './SignUpModal';

interface Player {
  username: string;
  role: 'vanguard' | 'duelist' | 'strategist';
  character: string;
}

interface MatchFoundModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  players: Player[];
  timeRemaining: number;
  isLoggedIn: boolean;
  onSignUp?: (email: string, password: string) => void;
}

export const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  players,
  timeRemaining,
  isLoggedIn,
  onSignUp
}) => {
  const [progress, setProgress] = useState(100);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / 30);
          return newProgress < 0 ? 0 : newProgress;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (!isLoggedIn) {
      setShowSignUp(true);
    } else {
      onAccept();
    }
  };

  const handleSignUp = (email: string, password: string) => {
    if (onSignUp) {
      onSignUp(email, password);
      setShowSignUp(false);
      onAccept();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vanguard':
        return Shield;
      case 'duelist':
        return Sword;
      case 'strategist':
        return Heart;
      default:
        return Shield;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"
          >
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl font-bold text-blue-400 mb-2">Match Found!</h2>
                <p className="text-gray-300">Game is ready to begin</p>
              </motion.div>

              {/* Timer Bar */}
              <div className="relative h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-0 bg-blue-500"
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              {/* Team Display */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-400">Team 1</h3>
                  {players.slice(0, 5).map((player, index) => {
                    const RoleIcon = getRoleIcon(player.role);
                    return (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg"
                      >
                        <RoleIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{player.username}</div>
                          <div className="text-sm text-gray-400">{player.character}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-400">Team 2</h3>
                  {players.slice(5).map((player, index) => {
                    const RoleIcon = getRoleIcon(player.role);
                    return (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg"
                      >
                        <RoleIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{player.username}</div>
                          <div className="text-sm text-gray-400">{player.character}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Accept ({timeRemaining}s)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDecline}
                  className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Decline
                </motion.button>
              </div>

              {!isLoggedIn && (
                <p className="text-center mt-4 text-gray-400">
                  Create an account to save your progress and preferences
                </p>
              )}
            </div>
          </motion.div>

          <SignUpModal
            isOpen={showSignUp}
            onClose={() => setShowSignUp(false)}
            onSignUp={handleSignUp}
            message="Create an account to join the match and save your progress!"
          />
        </>
      )}
    </AnimatePresence>
  );
};