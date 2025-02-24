import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PlayerProfile } from '../components/PlayerProfile';
import { useReviews } from '../hooks/useReviews';

export function ProfilePage() {
  const { user } = useAuth();

  // Mock data for demonstration
  const mockStats = {
    matches: 247,
    winRate: 63,
    mmr: 1872,
    roleStats: {
      tank: { matches: 128, winRate: 67 },
      damage: { matches: 89, winRate: 58 },
      support: { matches: 30, winRate: 53 }
    },
    heroStats: [
      { heroId: 'Iron Man', matches: 87, winRate: 72, kdRatio: 3.2, rating: 9.3 },
      { heroId: 'Thor', matches: 63, winRate: 68, kdRatio: 2.7, rating: 8.9 },
      { heroId: 'Black Panther', matches: 42, winRate: 65, kdRatio: 3.5, rating: 8.6 },
      { heroId: 'Doctor Strange', matches: 24, winRate: 58, kdRatio: 1.8, rating: 7.9 }
    ]
  };

  const mockReviews = [
    {
      id: '1',
      reviewerId: '2',
      reviewerName: 'SpiderFan99',
      heroPlayed: 'Iron Man',
      ratings: {
        teamwork: 9.5,
        communication: 9.0,
        skill: 9.2,
        adaptability: 8.8,
        positivity: 9.3
      },
      comment: 'Great teammate with excellent communication. Their Iron Man play was incredible, always protecting supports and focusing the right targets.',
      createdAt: new Date('2024-03-10')
    },
    {
      id: '2',
      reviewerId: '3',
      reviewerName: 'CapShield1945',
      heroPlayed: 'Thor',
      ratings: {
        teamwork: 8.5,
        communication: 8.7,
        skill: 9.0,
        adaptability: 7.2,
        positivity: 8.5
      },
      comment: 'Solid tank player who knows how to create space. Made good callouts but could be more flexible with hero picks when countered.',
      createdAt: new Date('2024-03-05')
    }
  ];

  const { reputation } = useReviews(user?.id || '');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <PlayerProfile
      userId={user.id}
      username={user.username}
      rank={{
        tier: 'DIAMOND',
        division: 'II',
        points: 4200
      }}
      reputation={{
        overall: 8.5,
        teamwork: 9.2,
        communication: 8.7,
        skill: 8.9,
        adaptability: 7.8,
        positivity: 8.1,
        totalReviews: 98
      }}
      stats={mockStats}
      reviews={mockReviews}
    />
  );
}