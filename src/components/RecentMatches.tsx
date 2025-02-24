import React from 'react';
import { Shield, Sword, Heart } from 'lucide-react';

interface Match {
  id: number;
  hero: string;
  result: 'victory' | 'defeat';
  role: string;
  map: string;
  score: string;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

interface RecentMatchesProps {
  matches: Match[];
}

export const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tank':
        return Shield;
      case 'damage':
        return Sword;
      case 'support':
        return Heart;
      default:
        return Shield;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>
      <div className="space-y-4">
        {matches.map((match) => {
          const RoleIcon = getRoleIcon(match.role);
          
          return (
            <div
              key={match.id}
              className={`
                p-4 rounded-lg
                ${match.result === 'victory' ? 'bg-green-900/20' : 'bg-red-900/20'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <RoleIcon className="w-5 h-5" />
                  <span className="font-semibold">{match.hero}</span>
                </div>
                <span
                  className={`
                    font-semibold
                    ${match.result === 'victory' ? 'text-green-400' : 'text-red-400'}
                  `}
                >
                  {match.result.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-300">
                <div>{match.map}</div>
                <div>{match.score}</div>
              </div>
              
              <div className="mt-2 flex justify-between text-sm">
                <div className="text-gray-300">
                  K/D/A: {match.stats.kills}/{match.stats.deaths}/{match.stats.assists}
                </div>
                <div className="text-gray-300">
                  KDA: {((match.stats.kills + match.stats.assists) / Math.max(1, match.stats.deaths)).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};