import React from 'react';
import { Users, Crown, UserPlus, Copy, ArrowRight } from 'lucide-react';

export function PartyGuide() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Party Guide</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Create a Party</h3>
          </div>
          <p className="text-gray-300 mb-3">
            Click the "Create Party" button to start a new party. You'll become the party leader and get a unique invite code.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ArrowRight className="w-4 h-4" />
            <span>Leaders can kick members and manage roles</span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold">Join a Party</h3>
          </div>
          <p className="text-gray-300 mb-3">
            Click "Join Party" and enter the 6-character invite code shared by the party leader.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ArrowRight className="w-4 h-4" />
            <span>Codes are case-insensitive</span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Copy className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Share Code</h3>
          </div>
          <p className="text-gray-300 mb-3">
            Party leaders can share their invite code with friends. Click the copy button next to the code to copy it.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ArrowRight className="w-4 h-4" />
            <span>Codes expire after 24 hours</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Party Features</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Select your role (Vanguard, Duelist, or Strategist)
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Mark yourself as ready when you're prepared to queue
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Chat with your party members in team chat
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Queue together for matches once everyone is ready
          </li>
        </ul>
      </div>
    </div>
  );
}