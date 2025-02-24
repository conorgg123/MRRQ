export type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'GRANDMASTER' | 'CELESTIAL' | 'ETERNITY' | 'ONE_ABOVE_ALL';

export type RankDivision = 'III' | 'II' | 'I';

export interface Rank {
  tier: RankTier;
  division: RankDivision;
  points: number;
}

export interface MatchmakingRules {
  minRankDiff: number;
  maxRankDiff: number;
  pointThreshold: number;
  canQueueTogether: (playerRank: Rank, teammateRank: Rank) => boolean;
}

export interface TeamSuggestion {
  synergy: number;
  composition: {
    vanguard: string[];
    duelist: string[];
    strategist: string[];
  };
  reason: string;
}

export interface QueueStats {
  waitTime: string;
  demand: 'low' | 'medium' | 'high';
}

export interface QueueState {
  isQueuing: boolean;
  estimatedTime: string;
  playersInQueue: number;
  selectedRole: string | null;
  selectedCharacters: {
    [key: string]: string[];
  };
  mainCharacters: string[];
  teamSuggestions: TeamSuggestion[];
  queueStats: {
    [role: string]: QueueStats;
  };
  freeRotation: {
    vanguard: string[];
    duelist: string[];
    strategist: string[];
  };
}

export interface MatchHistory {
  id: string;
  date: Date;
  map: string;
  mode: string;
  result: 'victory' | 'defeat' | 'draw';
  character: string;
  role: string;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    damage: number;
    healing: number;
    mitigation: number;
  };
  team: {
    id: string;
    username: string;
    character: string;
    role: string;
  }[];
}

export interface RoleStats {
  vanguard: {
    gamesPlayed: number;
    winRate: number;
    averageMitigation: number;
    bestCharacters: string[];
  };
  duelist: {
    gamesPlayed: number;
    winRate: number;
    averageDamage: number;
    bestCharacters: string[];
  };
  strategist: {
    gamesPlayed: number;
    winRate: number;
    averageHealing: number;
    bestCharacters: string[];
  };
}

export interface Commendation {
  type: 'shotcaller' | 'friendly' | 'teamplayer' | 'skilled';
  count: number;
  recentFrom: {
    username: string;
    timestamp: Date;
  }[];
}