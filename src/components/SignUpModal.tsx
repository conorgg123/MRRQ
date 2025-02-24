import React, { useState } from 'react';
import { Mail, Lock, X, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SignUpModal({ isOpen, onClose, message }: SignUpModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const { signIn, signUp, error, loading } = useAuth();

  if (!isOpen) return null;

  const isFormValid = () => {
    if (mode === 'signin') {
      return emailOrUsername.trim().length >= 3 && password.trim().length >= 6;
    } else {
      return email.trim().length > 0 && password.trim().length >= 6 && username.trim().length >= 3;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    if (!isFormValid()) return;
    
    try {
      if (mode === 'signin') {
        const result = await signIn(emailOrUsername.trim(), password);
        console.log("Sign-in result:", result); // Debugging
        if (result) {
          onClose();
          setEmailOrUsername('');
          setPassword('');
          setAttemptedSubmit(false);
        }
      } else {
        const result = await signUp(email.trim(), password, username.trim());
        console.log("Sign-up result:", result); // Debugging
        if (result) {
          onClose();
          setEmail('');
          setPassword('');
          setUsername('');
          setAttemptedSubmit(false);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const handleModeSwitch = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmailOrUsername('');
    setEmail('');
    setPassword('');
    setUsername('');
    setAttemptedSubmit(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-2">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        {message && <p className="text-blue-400 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-2 bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
                minLength={3}
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              minLength={6}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-2 rounded-md font-semibold transition bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
          <button type="button" onClick={handleModeSwitch} className="text-blue-400 hover:text-blue-300">
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
