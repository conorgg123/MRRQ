import { useState, useCallback, useEffect } from 'react';
import { supabase, getCurrentUser, subscribeToQueue, subscribeToMatches, joinMatchmaking, leaveMatchmaking } from '../lib/supabase';
import type { Rank, QueueState } from '../types/matchmaking';

const INITIAL_QUEUE_STATE: QueueState = {
  isQueuing: false,
  estimatedTime: '0:00',
  playersInQueue: 0,
  selectedRole: null,
  selectedCharacters: {
    vanguard: [],
    duelist: [],
    strategist: []
  },
  mainCharacters: [],
  teamSuggestions: [],
  queueStats: {
    vanguard: { waitTime: '2:30', demand: 'high' },
    duelist: { waitTime: '5:45', demand: 'medium' },
    strategist: { waitTime: '1:15', demand: 'low' }
  },
  freeRotation: {
    vanguard: ['thor', 'captain-america'],
    duelist: ['iron-man', 'black-widow'],
    strategist: ['mantis', 'invisible-woman']
  }
};

export function useMatchmaking(userRank: Rank) {
  const [queueState, setQueueState] = useState<QueueState>(INITIAL_QUEUE_STATE);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    let queueSubscription: any;
    let matchSubscription: any;

    const initSubscriptions = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      queueSubscription = subscribeToQueue(user.id, (data) => {
        setQueueState(prev => ({
          ...prev,
          playersInQueue: data.playersInQueue,
          estimatedTime: calculateEstimatedTime(data.playersInQueue, userRank)
        }));
      });

      matchSubscription = subscribeToMatches(user.id, () => {
        setMatchFound(true);
        playNotificationSound();
      });
    };

    initSubscriptions();

    return () => {
      if (queueSubscription) queueSubscription.unsubscribe();
      if (matchSubscription) matchSubscription.unsubscribe();
    };
  }, [userRank]);

  const calculateEstimatedTime = (playersInQueue: number, rank: Rank): string => {
    // Base time in seconds
    let baseTime = 120; // 2 minutes

    // Adjust based on players in queue
    const queueFactor = Math.max(0.5, Math.min(2, 10 / playersInQueue));
    baseTime *= queueFactor;

    // Adjust based on rank
    const rankFactors: { [key: string]: number } = {
      'BRONZE': 0.8,
      'SILVER': 0.9,
      'GOLD': 1.0,
      'PLATINUM': 1.2,
      'DIAMOND': 1.4,
      'GRANDMASTER': 1.6,
      'CELESTIAL': 1.8,
      'ETERNITY': 2.0,
      'ONE_ABOVE_ALL': 2.5
    };

    baseTime *= rankFactors[rank.tier] || 1;

    // Convert to minutes:seconds format
    const minutes = Math.floor(baseTime / 60);
    const seconds = Math.floor(baseTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const joinQueue = useCallback(async (role: string, characters: string[], mainCharacters: string[]) => {
    if (characters.length === 0) return;

    const user = await getCurrentUser();
    if (!user) return;

    try {
      await joinMatchmaking(user.id, role, characters);

      setQueueState(prev => ({
        ...prev,
        isQueuing: true,
        selectedRole: role,
        selectedCharacters: {
          ...prev.selectedCharacters,
          [role]: characters
        },
        mainCharacters
      }));
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  }, []);

  const leaveQueue = useCallback(async () => {
    const user = await getCurrentUser();
    if (!user) return;

    try {
      await leaveMatchmaking(user.id);
      setQueueState(INITIAL_QUEUE_STATE);
      setMatchFound(false);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  }, []);

  return {
    queueState,
    matchFound,
    joinQueue,
    leaveQueue
  };
}