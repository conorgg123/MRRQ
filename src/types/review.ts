export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  targetId: string;
  matchId: string;
  heroPlayed: string;
  ratings: {
    teamwork: number;
    communication: number;
    skill: number;
    adaptability: number;
    positivity: number;
  };
  comment: string;
  createdAt: Date;
}

export interface ReputationScore {
  overall: number;
  teamwork: number;
  communication: number;
  skill: number;
  adaptability: number;
  positivity: number;
  totalReviews: number;
}

export interface PlayerStats {
  matches: number;
  winRate: number;
  mmr: number;
  roleStats: {
    tank: { matches: number; winRate: number };
    damage: { matches: number; winRate: number };
    support: { matches: number; winRate: number };
  };
  heroStats: {
    heroId: string;
    matches: number;
    winRate: number;
    kdRatio: number;
    rating: number;
  }[];
}