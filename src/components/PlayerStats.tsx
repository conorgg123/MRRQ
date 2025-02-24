import React from 'react';
import { Shield, Sword, Heart } from 'lucide-react';

interface PlayerStatsProps {
  stats: {
    rank: string;
    mmr: number;
    winRate: number;
    gamesPlayed: number;
    roleStats: {
      tank: { winRate: number; gamesPlayed: number };
      damage: { winRate: number; gamesPlayed: number };
      support: { winRate: number; gamesPlayed: number };
    };
  };
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ stats }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{stats.rank}</h2>
        <div className="text-gray-300">MMR: {stats.mmr}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.winRate}%</div>
          <div className="text-sm text-gray-300">Win Rate</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.gamesPlayed}</div>
          <div className="text-sm text-gray-300">Games Played</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Role Performance</h3>
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 mr-2" />
            <span className="font-semibold">Tank</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Win Rate: {stats.roleStats.tank.winRate}%</span>
            <span className="text-gray-300">{stats.roleStats.tank.gamesPlayed} games</span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Sword className="w-5 h-5 mr-2" />
            <span className="font-semibold">Damage</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Win Rate: {stats.roleStats.damage.winRate}%</span>
            <span className="text-gray-300">{stats.roleStats.damage.gamesPlayed} games</span>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Heart className="w-5 h-5 mr-2" />
            <span className="font-semibold">Support</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Win Rate: {stats.roleStats.support.winRate}%</span>
            <span className="text-gray-300">{stats.roleStats.support.gamesPlayed} games</span>
          </div>
        </div>
      </div>
    </div>
  );
};