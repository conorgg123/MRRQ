import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const createParty = async () => {
  const { data, error } = await supabase
    .rpc('create_party_with_code');

  if (error) throw error;
  return data;
};

export const joinPartyWithCode = async (code: string) => {
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('id, code')
    .eq('code', code.toUpperCase())
    .single();

  if (partyError) throw partyError;

  const { error: memberError } = await supabase
    .from('party_members')
    .insert({
      party_id: party.id,
      user_id: (await getCurrentUser())?.id
    });

  if (memberError) throw memberError;

  return party;
};

export const leaveParty = async (partyId: string) => {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('party_members')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const setPartyMemberRole = async (partyId: string, role: string) => {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('party_members')
    .update({ role })
    .eq('party_id', partyId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const setPartyMemberReady = async (partyId: string, ready: boolean) => {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('party_members')
    .update({ ready })
    .eq('party_id', partyId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const kickPartyMember = async (partyId: string, memberId: string) => {
  const user = await getCurrentUser();
  if (!user) return;

  // Verify user is party leader
  const { data: party } = await supabase
    .from('parties')
    .select('leader_id')
    .eq('id', partyId)
    .single();

  if (party?.leader_id !== user.id) return;

  const { error } = await supabase
    .from('party_members')
    .delete()
    .eq('party_id', partyId)
    .eq('user_id', memberId);

  if (error) throw error;
};

export const subscribeToParty = (partyId: string, onUpdate: (data: any) => void) => {
  return supabase
    .channel(`party:${partyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'party_members'
      },
      (payload) => onUpdate(payload)
    )
    .subscribe();
};

export const subscribeToPartyChat = (partyId: string, onMessage: (data: any) => void) => {
  return supabase
    .channel(`party_chat:${partyId}`)
    .on(
      'broadcast',
      { event: 'new_message' },
      (payload) => onMessage(payload)
    )
    .subscribe();
};

export const sendPartyMessage = async (partyId: string, message: string) => {
  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('party_messages')
    .insert({
      party_id: partyId,
      user_id: user.id,
      content: message
    });

  if (error) throw error;
  return data;
};

// Matchmaking functions
export const joinMatchmaking = async (userId: string, role: string, characters: string[]) => {
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .insert({
      user_id: userId,
      role,
      selected_characters: characters,
      status: 'queuing'
    });

  if (error) throw error;
  return data;
};

export const leaveMatchmaking = async (userId: string) => {
  const { error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

export const subscribeToQueue = (userId: string, onUpdate: (data: any) => void) => {
  return supabase
    .channel(`queue:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matchmaking_queue',
        filter: `user_id=eq.${userId}`
      },
      (payload) => onUpdate(payload)
    )
    .subscribe();
};

export const subscribeToMatches = (userId: string, onMatch: (data: any) => void) => {
  return supabase
    .channel(`matches:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `player_ids=cs.{${userId}}`
      },
      (payload) => onMatch(payload)
    )
    .subscribe();
};