import { supabase } from './supabaseClient';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

// קבלת כל ההודעות
export async function getMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data;
}

// שליחת הודעה חדשה
export async function sendMessage(sender: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// סימון הודעה כנקראה
export async function markAsRead(id: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

// מחיקת הודעה
export async function deleteMessage(id: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// האזנה להודעות חדשות בזמן אמת
export function subscribeToMessages(callback: (message: Message) => void) {
  const subscription = supabase
    .channel('messages_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
