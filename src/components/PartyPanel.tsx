import React, { useState } from 'react';
import { Users, Crown, X, Copy, Check, UserPlus } from 'lucide-react';

interface Party {
  id: string;
  leaderId: string;
  members: {
    id: string;
    username: string;
    role: string | null;
    ready: boolean;
  }[];
  maxSize: number;
  status: 'forming' | 'ready' | 'in_queue';
}

interface PartyPanelProps {
  party: Party | null;
  currentUserId: string;
  inviteCode: string | null;
  error: string | null;
  loading: boolean;
  onCreateParty: () => void;
  onJoinParty: (code: string) => void;
  onLeaveParty: () => void;
  onKickMember: (userId: string) => void;
  onSetRole: (role: string) => void;
  onSetReady: (ready: boolean) => void;
}

export function PartyPanel({
  party,
  currentUserId,
  inviteCode,
  error,
  loading,
  onCreateParty,
  onJoinParty,
  onLeaveParty,
  onKickMember,
  onSetRole,
  onSetReady
}: PartyPanelProps) {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinParty(joinCode);
      setShowJoinInput(false);
      setJoinCode('');
    }
  };

  if (!party) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Party</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinInput(!showJoinInput)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Join Party
            </button>
            <button
              onClick={onCreateParty}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Party'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {showJoinInput && (
          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter party code"
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={!joinCode.trim() || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Join'
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  const isLeader = party.leaderId === currentUserId;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Your Party</h2>
        </div>
        {inviteCode && (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 font-mono">
              Party Code: {inviteCode}
            </div>
            <button
              onClick={handleCopyInviteCode}
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {party.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              {member.id === party.leaderId && (
                <Crown className="w-5 h-5 text-yellow-400" />
              )}
              <span className="font-medium">
                {member.username}
                {member.id === currentUserId && ' (You)'}
              </span>
              <span className={`text-sm ${member.ready ? 'text-green-400' : 'text-gray-400'}`}>
                {member.ready ? 'Ready' : 'Not Ready'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {member.id === currentUserId ? (
                <>
                  <select
                    value={member.role || ''}
                    onChange={(e) => onSetRole(e.target.value)}
                    className="px-3 py-1 bg-gray-600 rounded-lg text-sm"
                  >
                    <option value="">Select Role</option>
                    <option value="vanguard">Vanguard</option>
                    <option value="duelist">Duelist</option>
                    <option value="strategist">Strategist</option>
                  </select>
                  <button
                    onClick={() => onSetReady(!member.ready)}
                    className={`px-4 py-1 rounded-lg text-sm transition ${
                      member.ready
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {member.ready ? 'Ready' : 'Not Ready'}
                  </button>
                  <button
                    onClick={onLeaveParty}
                    className="p-1 text-gray-400 hover:text-white transition"
                    title="Leave party"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                isLeader && (
                  <button
                    onClick={() => onKickMember(member.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition"
                    title="Kick member"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}