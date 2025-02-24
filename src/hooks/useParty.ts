import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PartyMember {
  id: string;
  username: string;
  role: string | null;
  ready: boolean;
  mainCharacters: string[];
  selectedCharacters: string[];
  isLeader?: boolean;
}

interface Party {
  id: string;
  leaderId: string;
  members: PartyMember[];
  maxSize: number;
  status: 'forming' | 'ready' | 'in_queue';
}

export function useParty() {
  const [party, setParty] = useState<Party | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let partySubscription: any;

    const initPartySubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      partySubscription = supabase
        .channel('party_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'party_members',
            filter: `user_id=eq.${session.user.id}`
          },
          async () => {
            await fetchPartyData();
          }
        )
        .subscribe();

      await fetchPartyData();
    };

    initPartySubscription();

    return () => {
      if (partySubscription) partySubscription.unsubscribe();
    };
  }, []);

  const fetchPartyData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // First check if user is in any party
      const { data: partyMember, error: memberError } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', session.user.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (partyMember) {
        const { data: partyData, error: partyError } = await supabase
          .from('parties')
          .select(`
            id,
            leader_id,
            max_size,
            status,
            code,
            party_members (
              user_id,
              role,
              ready,
              users (
                username,
                main_characters,
                selected_characters
              )
            )
          `)
          .eq('id', partyMember.party_id)
          .single();

        if (partyError) throw partyError;

        if (partyData) {
          setParty({
            id: partyData.id,
            leaderId: partyData.leader_id,
            maxSize: partyData.max_size,
            status: partyData.status,
            members: partyData.party_members.map((member: any) => ({
              id: member.user_id,
              username: member.users.username,
              role: member.role,
              ready: member.ready,
              mainCharacters: member.users.main_characters || [],
              selectedCharacters: member.users.selected_characters || [],
              isLeader: member.user_id === partyData.leader_id
            }))
          });

          setInviteCode(partyData.code);
        }
      } else {
        setParty(null);
        setInviteCode(null);
      }
    } catch (error) {
      console.error('Error fetching party data:', error);
      setError('Failed to fetch party data');
    }
  };

  const createParty = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to create a party');
        return;
      }

      const { data, error } = await supabase.rpc('create_party_with_code');
      
      if (error) {
        console.error('Error creating party:', error);
        setError('Failed to create party. Please try again.');
        return;
      }

      setInviteCode(data.party_code);
      await fetchPartyData();
    } catch (error) {
      console.error('Error creating party:', error);
      setError('Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  const joinParty = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to join a party');
        return;
      }

      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('id')
        .eq('code', code.toUpperCase())
        .single();

      if (partyError) {
        setError('Invalid party code');
        return;
      }

      const { error: memberError } = await supabase
        .from('party_members')
        .insert({
          party_id: party.id,
          user_id: session.user.id,
          ready: false
        });

      if (memberError) {
        setError('Failed to join party');
        return;
      }

      await fetchPartyData();
    } catch (error) {
      console.error('Error joining party:', error);
      setError('Failed to join party');
    } finally {
      setLoading(false);
    }
  };

  const leaveParty = async () => {
    if (!party) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', party.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setParty(null);
      setInviteCode(null);
    } catch (error) {
      console.error('Error leaving party:', error);
      setError('Failed to leave party');
    } finally {
      setLoading(false);
    }
  };

  const setRole = async (role: string) => {
    if (!party) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('party_members')
        .update({ role })
        .eq('party_id', party.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      await fetchPartyData();
    } catch (error) {
      console.error('Error setting role:', error);
      setError('Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  const setReady = async (ready: boolean) => {
    if (!party) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('party_members')
        .update({ ready })
        .eq('party_id', party.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      await fetchPartyData();
    } catch (error) {
      console.error('Error setting ready status:', error);
      setError('Failed to set ready status');
    } finally {
      setLoading(false);
    }
  };

  const kickMember = async (userId: string) => {
    if (!party) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || party.leaderId !== session.user.id) return;

      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', party.id)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchPartyData();
    } catch (error) {
      console.error('Error kicking member:', error);
      setError('Failed to kick member');
    } finally {
      setLoading(false);
    }
  };

  return {
    party,
    inviteCode,
    error,
    loading,
    createParty,
    joinParty,
    leaveParty,
    setRole,
    setReady,
    kickMember
  };
}