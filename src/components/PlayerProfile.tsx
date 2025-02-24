import React from 'react';
import { Star, Users, MessageSquare, Brain, Smile } from 'lucide-react';
import type { ReputationScore, PlayerStats, Review } from '../types/review';

interface PlayerProfileProps {
  userId: string;
  username: string;
  avatar?: string;
  rank: {
    tier: string;
    division: string;
    points: number;
  };
  reputation: ReputationScore;
  stats: PlayerStats;
  reviews: Review[];
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  username,
  avatar,
  rank,
  reputation,
  stats,
  reviews
}) => {
  const getRankColor = (tier: string) => {
    switch (tier) {
      case 'ONE_ABOVE_ALL': return 'text-red-400';
      case 'ETERNITY': return 'text-purple-500';
      case 'CELESTIAL': return 'text-yellow-400';
      case 'GRANDMASTER': return 'text-purple-400';
      case 'DIAMOND': return 'text-blue-400';
      case 'PLATINUM': return 'text-cyan-400';
      case 'GOLD': return 'text-yellow-500';
      case 'SILVER': return 'text-gray-400';
      default: return 'text-bronze-400';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-400';
    if (rating >= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4">
                  {avatar && (
                    <img
                      src={avatar}
                      alt={username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{username}</h2>
                <div className={`text-lg font-semibold ${getRankColor(rank.tier)}`}>
                  {rank.tier} {rank.division}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {rank.points} points
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.matches}</div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.winRate}%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.mmr}</div>
                  <div className="text-sm text-gray-400">MMR</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{reputation.totalReviews}</div>
                  <div className="text-sm text-gray-400">Reviews</div>
                </div>
              </div>

              {/* Reputation Score */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Reputation Score</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall</span>
                      <span className={getRatingColor(reputation.overall)}>
                        {reputation.overall.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(reputation.overall / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Teamwork</span>
                      <span className={getRatingColor(reputation.teamwork)}>
                        {reputation.teamwork.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(reputation.teamwork / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Communication</span>
                      <span className={getRatingColor(reputation.communication)}>
                        {reputation.communication.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${(reputation.communication / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Skill</span>
                      <span className={getRatingColor(reputation.skill)}>
                        {reputation.skill.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${(reputation.skill / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Adaptability</span>
                      <span className={getRatingColor(reputation.adaptability)}>
                        {reputation.adaptability.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(reputation.adaptability / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Positivity</span>
                      <span className={getRatingColor(reputation.positivity)}>
                        {reputation.positivity.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500"
                        style={{ width: `${(reputation.positivity / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Top Heroes */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-400">Top Heroes</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition">
                    All Time
                  </button>
                  <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition">
                    This Season
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.heroStats.slice(0, 4).map((hero) => (
                  <div key={hero.heroId} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                      <div>
                        <div className="font-semibold">{hero.heroId}</div>
                        <div className="text-sm text-gray-400">Damage</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{hero.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{hero.matches}</div>
                        <div className="text-xs text-gray-400">Matches</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{hero.kdRatio.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">K/D Ratio</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{hero.rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-400">Player Reviews</h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Write Review
                </button>
              </div>

              <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm whitespace-nowrap">
                  All Reviews
                </button>
                <button className="px-4 py-2 bg-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-600 transition">
                  Highest Rated
                </button>
                <button className="px-4 py-2 bg-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-600 transition">
                  Lowest Rated
                </button>
                <button className="px-4 py-2 bg-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-600 transition">
                  Most Recent
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600">
                          {review.reviewerAvatar && (
                            <img
                              src={review.reviewerAvatar}
                              alt={review.reviewerName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{review.reviewerName}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Played as: {review.heroPlayed}
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{review.comment}</p>

                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-gray-600 rounded-lg text-sm">
                        Teamwork: {review.ratings.teamwork}/10
                      </div>
                      <div className="px-3 py-1 bg-gray-600 rounded-lg text-sm">
                        Communication: {review.ratings.communication}/10
                      </div>
                      <div className="px-3 py-1 bg-gray-600 rounded-lg text-sm">
                        Skill: {review.ratings.skill}/10
                      </div>
                      <div className="px-3 py-1 bg-gray-600 rounded-lg text-sm">
                        Adaptability: {review.ratings.adaptability}/10
                      </div>
                      <div className="px-3 py-1 bg-gray-600 rounded-lg text-sm">
                        Positivity: {review.ratings.positivity}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-6">
                <button className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  3
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  4
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                  5
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};