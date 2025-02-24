import React, { useState, useEffect } from 'react';
import { Shield, Sword, Heart, Star, Info, Users, ChevronDown, Monitor, Gamepad, Globe, Clock } from 'lucide-react';
import { RoleQueue } from '../components/RoleQueue';
import { TeamChat } from '../components/TeamChat';
import { SignUpModal } from '../components/SignUpModal';
import { PartyPanel } from '../components/PartyPanel';
import { PartyGuide } from '../components/PartyGuide';
import { useAuth } from '../hooks/useAuth';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useTeamChat } from '../hooks/useTeamChat';
import { useParty } from '../hooks/useParty';
import type { RankTier, RankDivision } from '../types/matchmaking';

// Available characters per role
const CHARACTERS = {
  vanguard: [
    { id: 'bruce-banner', name: 'Bruce Banner (Hulk)', difficulty: 2 },
    { id: 'captain-america', name: 'Captain America', difficulty: 1 },
    { id: 'doctor-strange', name: 'Doctor Strange', difficulty: 3 },
    { id: 'groot', name: 'Groot', difficulty: 2 },
    { id: 'magneto', name: 'Magneto', difficulty: 3 },
    { id: 'peni-parker', name: 'Peni Parker', difficulty: 3 },
    { id: 'thor', name: 'Thor', difficulty: 2 },
    { id: 'venom', name: 'Venom', difficulty: 3 }
  ],
  duelist: [
    { id: 'black-panther', name: 'Black Panther', difficulty: 2 },
    { id: 'black-widow', name: 'Black Widow', difficulty: 2 },
    { id: 'hawkeye', name: 'Hawkeye', difficulty: 2 },
    { id: 'hela', name: 'Hela', difficulty: 3 },
    { id: 'iron-fist', name: 'Iron Fist', difficulty: 2 },
    { id: 'iron-man', name: 'Iron Man', difficulty: 2 },
    { id: 'magik', name: 'Magik', difficulty: 3 },
    { id: 'mister-fantastic', name: 'Mister Fantastic', difficulty: 3 },
    { id: 'moon-knight', name: 'Moon Knight', difficulty: 3 },
    { id: 'namor', name: 'Namor', difficulty: 3 },
    { id: 'psylocke', name: 'Psylocke', difficulty: 2 },
    { id: 'scarlet-witch', name: 'Scarlet Witch', difficulty: 3 },
    { id: 'spider-man', name: 'Spider-Man', difficulty: 2 },
    { id: 'squirrel-girl', name: 'Squirrel Girl', difficulty: 2 },
    { id: 'star-lord', name: 'Star-Lord', difficulty: 2 },
    { id: 'storm', name: 'Storm', difficulty: 2 },
    { id: 'punisher', name: 'The Punisher', difficulty: 2 },
    { id: 'winter-soldier', name: 'Winter Soldier', difficulty: 2 },
    { id: 'wolverine', name: 'Wolverine', difficulty: 2 }
  ],
  strategist: [
    { id: 'adam-warlock', name: 'Adam Warlock', difficulty: 3 },
    { id: 'cloak-and-dagger', name: 'Cloak & Dagger', difficulty: 3 },
    { id: 'invisible-woman', name: 'Invisible Woman', difficulty: 2 },
    { id: 'jeff', name: 'Jeff the Land Shark', difficulty: 1 },
    { id: 'loki', name: 'Loki', difficulty: 3 },
    { id: 'luna-snow', name: 'Luna Snow', difficulty: 2 },
    { id: 'mantis', name: 'Mantis', difficulty: 1 },
    { id: 'rocket-raccoon', name: 'Rocket Raccoon', difficulty: 3 }
  ]
};

const RANK_TIERS: RankTier[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'GRANDMASTER',
  'CELESTIAL',
  'ETERNITY',
  'ONE_ABOVE_ALL'
];

const RANK_DIVISIONS: RankDivision[] = ['III', 'II', 'I'];

const REGIONS = [
  { id: 'na', name: 'North America', ping: '10-60ms' },
  { id: 'eu', name: 'Europe', ping: '30-80ms' },
  { id: 'asia', name: 'Asia', ping: '50-100ms' },
  { id: 'me', name: 'Middle East', ping: '60-110ms' },
  { id: 'oce', name: 'Oceania', ping: '40-90ms' }
];

export default function QueuePage() {
  const { user, signUp } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<{[key: string]: string[]}>({
    vanguard: [],
    duelist: [],
    strategist: []
  });
  const [mainCharacters, setMainCharacters] = useState<string[]>([]);
  const [isQueuing, setIsQueuing] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<{[key: string]: number}>({});
  const [showRankSelector, setShowRankSelector] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [queueStartTime, setQueueStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('0:00');

  const [selectedRank, setSelectedRank] = useState({
    tier: 'GOLD' as RankTier,
    division: 'III' as RankDivision,
    points: 2000
  });

  const { queueState, matchFound, joinQueue, leaveQueue } = useMatchmaking(selectedRank);
  const { messages, sendMessage } = useTeamChat(teamId || 'default-team');
  const {
    party,
    inviteCode,
    createParty,
    joinParty,
    leaveParty,
    setRole,
    setReady,
    kickMember
  } = useParty();

  // Get character name from ID
  const getCharacterName = (characterId: string): string => {
    for (const role of Object.values(CHARACTERS)) {
      const character = role.find(c => c.id === characterId);
      if (character) return character.name;
    }
    return characterId;
  };

  // Get role from character ID
  const getCharacterRole = (characterId: string): string => {
    for (const [role, characters] of Object.entries(CHARACTERS)) {
      if (characters.some(c => c.id === characterId)) return role;
    }
    return 'unknown';
  };

  // Create team players array with only the current user
  const teamPlayers = React.useMemo(() => {
    const players = [];

    if (user) {
      const userSelectedChars = Object.values(selectedCharacters).flat();
      const userMainChars = mainCharacters;
      
      players.push({
        id: user.id,
        username: user.username,
        role: getCharacterRole(userSelectedChars[0] || ''),
        mainCharacters: userMainChars.map(getCharacterName),
        selectedCharacters: userSelectedChars.map(getCharacterName)
      });
    }

    return players;
  }, [user, selectedCharacters, mainCharacters]);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (matchFound) {
      const notification = new Notification('Match Found!', {
        body: 'Your game is ready. Click to accept.',
        icon: '/vite.svg'
      });

      notification.onclick = () => {
        console.log('Match accepted');
      };
    }
  }, [matchFound]);

  useEffect(() => {
    let intervalId: number;

    if (isQueuing && queueStartTime) {
      intervalId = window.setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - queueStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isQueuing, queueStartTime]);

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp(email, password);
      setShowSignUp(false);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleCharacterClick = (role: string, characterId: string) => {
    const now = Date.now();
    const lastClick = lastClickTime[characterId] || 0;
    const isDoubleClick = now - lastClick < 300;

    setLastClickTime(prev => ({
      ...prev,
      [characterId]: now
    }));

    if (isDoubleClick) {
      setMainCharacters(prev => {
        if (prev.includes(characterId)) {
          return prev.filter(id => id !== characterId);
        }
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, characterId];
      });
    } else {
      setSelectedCharacters(prev => {
        const currentSelected = prev[role];
        const isSelected = currentSelected.includes(characterId);
        
        if (isSelected) {
          return {
            ...prev,
            [role]: currentSelected.filter(id => id !== characterId)
          };
        } else {
          if (currentSelected.length >= 3) {
            return prev;
          }
          return {
            ...prev,
            [role]: [...currentSelected, characterId]
          };
        }
      });
    }
  };

  const hasSelectedCharacters = () => {
    const totalSelected = Object.values(selectedCharacters).reduce(
      (total, chars) => total + chars.length,
      0
    );
    return totalSelected > 0;
  };

  const canJoinQueue = () => {
    return hasSelectedCharacters() && selectedRegion !== null;
  };

  const handleQueueJoin = () => {
    if (!canJoinQueue()) return;
    
    if (isQueuing) {
      leaveQueue();
      setIsQueuing(false);
      setTeamId(null);
      setQueueStartTime(null);
      setElapsedTime('0:00');
    } else {
      const allSelectedCharacters = Object.values(selectedCharacters).flat();
      joinQueue('flex', allSelectedCharacters, mainCharacters);
      setIsQueuing(true);
      setTeamId(Math.random().toString(36).substr(2, 9));
      setQueueStartTime(new Date());

      if (!user) {
        setTimeout(() => {
          setShowSignUp(true);
        }, 2000);
      }
    }
  };

  const handleSendMessage = (text: string) => {
    if (user) {
      sendMessage(user.id, user.username, text);
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

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'vanguard':
        return {
          name: 'Vanguard',
          icon: Shield,
          color: 'text-red-400',
          description: 'Lead the charge and protect your team'
        };
      case 'duelist':
        return {
          name: 'Duelist',
          icon: Sword,
          color: 'text-yellow-400',
          description: 'Deal devastating damage to enemy heroes'
        };
      case 'strategist':
        return {
          name: 'Strategist',
          icon: Heart,
          color: 'text-green-400',
          description: 'Support and enable your team\'s success'
        };
      default:
        return null;
    }
  };

  const getRankColor = (tier: RankTier) => {
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Website Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-2">Marvel Rivals Queue</h2>
              <p className="text-gray-300 mb-2">
                Welcome to the Marvel Rivals competitive matchmaking system. Select your preferred heroes and join the queue to find balanced matches with players of similar skill levels.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Double-click heroes to mark them as mains (max 3)
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Select up to 3 heroes per role
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Team up with players in your rank range
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PC Only Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">PC Players Only</h2>
                <p className="text-blue-100">Matchmaking is currently available exclusively for PC players</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Gamepad className="w-5 h-5 text-blue-200 opacity-50" />
              <span className="text-blue-200">Console support coming soon</span>
            </div>
          </div>
        </div>

        {/* Party Guide */}
        <PartyGuide />

        {/* Region Selection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Select Your Region</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`
                  p-4 rounded-lg transition-all duration-200 relative
                  ${selectedRegion === region.id
                    ? 'bg-blue-600 ring-2 ring-blue-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{region.name}</h3>
                  <div className="text-sm text-gray-300">{region.ping}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Party System */}
        <PartyPanel
          party={party}
          currentUserId={user?.id || ''}
          inviteCode={inviteCode}
          onCreateParty={createParty}
          onJoinParty={joinParty}
          onLeaveParty={leaveParty}
          onKickMember={kickMember}
          onSetRole={setRole}
          onSetReady={setReady}
        />

        {/* Player Rank Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Current Rank</h2>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => setShowRankSelector(!showRankSelector)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <span className={`text-3xl font-bold ${getRankColor(selectedRank.tier)}`}>
                    {selectedRank.tier} {selectedRank.division}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {selectedRank.points} points
              </div>
            </div>
          </div>

          {/* Rank Selector Dropdown */}
          {showRankSelector && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tier</label>
                  <select
                    value={selectedRank.tier}
                    onChange={(e) => setSelectedRank(prev => ({
                      ...prev,
                      tier: e.target.value as RankTier
                    }))}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    {RANK_TIERS.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Division</label>
                  <select
                    value={selectedRank.division}
                    onChange={(e) => setSelectedRank(prev => ({
                      ...prev,
                      division: e.target.value as RankDivision
                    }))}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    {RANK_DIVISIONS.map(division => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Character Selection */}
        {Object.entries(CHARACTERS).map(([role, characters]) => {
          const roleInfo = getRoleInfo(role)!;
          return (
            <div key={role} className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <roleInfo.icon className={`w-6 h-6 ${roleInfo.color}`} />
                  <h2 className={`text-2xl font-bold ${roleInfo.color}`}>{roleInfo.name}s</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Selected: {selectedCharacters[role].length}/3
                  </span>
                  <span className="text-sm text-gray-400">
                    Main Characters: {mainCharacters.length}/3
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mb-6">{roleInfo.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => handleCharacterClick(role, character.id)}
                    className={`
                      p-4 rounded-lg transition-all duration-200 relative
                      ${selectedCharacters[role].includes(character.id)
                        ? `bg-blue-600 ring-2 ring-blue-400`
                        : 'bg-gray-700 hover:bg-gray-600'
                      }
                      ${mainCharacters.includes(character.id) ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
                      <div className="text-sm text-gray-300">
                        Difficulty: {Array(character.difficulty).fill('★').join('')}
                      </div>
                      {mainCharacters.includes(character.id) && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Queue Button */}
        <div className="mt-8">
          <button
            onClick={handleQueueJoin}
            disabled={!canJoinQueue()}
            className={`
              w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200
              ${isQueuing
                ? 'bg-red-600 hover:bg-red-700'
                : canJoinQueue()
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isQueuing ? 'Leave Queue' : 'Join Queue'}
          </button>
          
          {isQueuing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Estimated: {queueState.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">Elapsed: {elapsedTime}</span>
                </div>
              </div>
              <div className="text-center text-gray-400">
                <p>Players in queue: {queueState.playersInQueue}</p>
                <p>Region: {REGIONS.find(r => r.id === selectedRegion)?.name}</p>
              </div>
            </div>
          )}
          
          {!canJoinQueue() && (
            <p className="text-center mt-4 text-gray-400">
              {!hasSelectedCharacters() && 'Select at least one character'}
              {hasSelectedCharacters() && !selectedRegion && 'Select your region'}
              {' to join queue'}
            </p>
          )}
        </div>

        {/* Team Chat */}
        {isQueuing && teamId && (
          <div className="mt-8">
            {user ? (
              teamPlayers.length > 0 ? (
                <TeamChat
                  teamId={teamId}
                  currentUser={{
                    id: user.id,
                    username: user.username
                  }}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  players={teamPlayers}
                />
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <p className="text-gray-300">Waiting for players to join...</p>
                </div>
              )
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-300 mb-4">
                  Create an account to chat with your team and save your preferences!
                </p>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Sign Up Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sign Up Modal */}
        <SignUpModal
          isOpen={showSignUp}
          onClose={() => setShowSignUp(false)}
          onSignUp={handleSignUp}
          message={
            isQueuing
              ? "Create an account to chat with your team and save your preferences!"
              : "Create an account to track your stats and save your preferences!"
          }
        />
      </div>
    </main>
  );
}

export { QueuePage };