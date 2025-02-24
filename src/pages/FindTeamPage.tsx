import React, { useState, useEffect } from 'react';
import { Shield, Sword, Heart, Users, Star, Clock, Search, Filter, UserCircle, Monitor, Mic, Gamepad } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface TeamListing {
  id: string;
  leader: {
    username: string;
    rank: string;
    avatar?: string;
  };
  roles: {
    vanguard: boolean;
    duelist: boolean;
    strategist: boolean;
  };
  requirements: {
    minRank: string;
    maxRank: string;
    mic: boolean;
    minLevel: number;
    region: string;
    preferredTime: string;
  };
  description: string;
  createdAt: Date;
}

const REGIONS = [
  'NA East',
  'NA West',
  'EU West',
  'EU East',
  'Asia Pacific',
  'South America',
  'Oceania'
];

export function FindTeamPage() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [micRequired, setMicRequired] = useState<boolean | null>(null);
  const [teamListings, setTeamListings] = useState<TeamListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamListings();
  }, [roleFilter, regionFilter, micRequired]);

  const fetchTeamListings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('parties')
        .select(`
          id,
          leader_id,
          status,
          requirements,
          description,
          created_at,
          party_members (
            role,
            users (
              username,
              rank_tier,
              rank_division,
              avatar_url
            )
          )
        `)
        .eq('status', 'forming');

      if (roleFilter) {
        query = query.contains('needed_roles', [roleFilter]);
      }

      if (regionFilter) {
        query = query.eq('region', regionFilter);
      }

      if (micRequired !== null) {
        query = query.eq('mic_required', micRequired);
      }

      const { data, error } = await query;

      if (error) throw error;

      const listings = data.map(party => ({
        id: party.id,
        leader: {
          username: party.party_members.find(m => m.user_id === party.leader_id)?.users.username || 'Unknown',
          rank: `${party.party_members.find(m => m.user_id === party.leader_id)?.users.rank_tier || 'Unknown'} ${party.party_members.find(m => m.user_id === party.leader_id)?.users.rank_division || ''}`,
          avatar: party.party_members.find(m => m.user_id === party.leader_id)?.users.avatar_url
        },
        roles: {
          vanguard: party.needed_roles.includes('vanguard'),
          duelist: party.needed_roles.includes('duelist'),
          strategist: party.needed_roles.includes('strategist')
        },
        requirements: party.requirements,
        description: party.description,
        createdAt: new Date(party.created_at)
      }));

      setTeamListings(listings);
    } catch (error) {
      console.error('Error fetching team listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes('Celestial')) return 'text-yellow-400';
    if (rank.includes('Diamond')) return 'text-blue-400';
    if (rank.includes('Platinum')) return 'text-cyan-400';
    if (rank.includes('Gold')) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleApply = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('party_applications')
        .insert({
          party_id: teamId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      // Show success message or update UI
    } catch (error) {
      console.error('Error applying to team:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find a Team</h1>
            <div className="flex items-center gap-2 text-gray-400">
              <Monitor className="w-5 h-5" />
              <p>PC Players Only</p>
            </div>
          </div>
          <button
            onClick={() => {}} // TODO: Implement create listing modal
            className="mt-4 md:mt-0 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Team Listing
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Roles Needed</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRoleFilter(roleFilter === 'vanguard' ? null : 'vanguard')}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        roleFilter === 'vanguard' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      Vanguard
                    </button>
                    <button
                      onClick={() => setRoleFilter(roleFilter === 'duelist' ? null : 'duelist')}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        roleFilter === 'duelist' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Sword className="w-5 h-5" />
                      Duelist
                    </button>
                    <button
                      onClick={() => setRoleFilter(roleFilter === 'strategist' ? null : 'strategist')}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        roleFilter === 'strategist' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      Strategist
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Region</label>
                  <select
                    value={regionFilter || ''}
                    onChange={(e) => setRegionFilter(e.target.value || null)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Regions</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Microphone</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMicRequired(micRequired === true ? null : true)}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        micRequired === true ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                      Required
                    </button>
                    <button
                      onClick={() => setMicRequired(micRequired === false ? null : false)}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                        micRequired === false ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                      Optional
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Team Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading team listings...</p>
            </div>
          ) : teamListings.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Teams Found</h3>
              <p className="text-gray-400">
                {roleFilter || regionFilter || micRequired !== null
                  ? "No teams match your filters. Try adjusting your search criteria."
                  : "There are no teams looking for players right now. Create a team listing to get started!"}
              </p>
            </div>
          ) : (
            teamListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                      {listing.leader.avatar ? (
                        <img
                          src={listing.leader.avatar}
                          alt={listing.leader.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{listing.leader.username}</span>
                        <span className={`text-sm ${getRankColor(listing.leader.rank)}`}>
                          {listing.leader.rank}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{listing.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.roles.vanguard && (
                          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Vanguard
                          </span>
                        )}
                        {listing.roles.duelist && (
                          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1">
                            <Sword className="w-4 h-4" />
                            Duelist
                          </span>
                        )}
                        {listing.roles.strategist && (
                          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            Strategist
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1">
                          <Monitor className="w-4 h-4" />
                          PC Only
                        </span>
                        {listing.requirements.mic && (
                          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-1">
                            <Mic className="w-4 h-4" />
                            Mic Required
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                          Level {listing.requirements.minLevel}+
                        </span>
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                          {listing.requirements.region}
                        </span>
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                          {listing.requirements.preferredTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {listing.requirements.minRank} - {listing.requirements.maxRank}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(listing.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleApply(listing.id)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}