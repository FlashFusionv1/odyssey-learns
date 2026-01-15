import { supabase } from '@/integrations/supabase/client';

/**
 * Generate encryption key from user session token
 * Uses first 32 characters of access token for symmetric encryption
 */
const getEncryptionKey = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session for encryption');
  // Use session token as encryption key (unique per user)
  return session.access_token.substring(0, 32);
};

/**
 * Encrypt a single field using pgcrypto's symmetric encryption via RPC
 */
const encryptField = async (field: string | null, key: string) => {
  if (!field) return null;
  // @ts-ignore - Types will regenerate after migration
  const { data, error } = await supabase.rpc('encrypt_emotion_field', {
    plaintext: field,
    encryption_key: key
  });
  if (error) throw error;
  return data;
};

/**
 * Decrypt a single field using pgcrypto's symmetric decryption via RPC
 */
const decryptField = async (field: unknown, key: string): Promise<string | null> => {
  if (!field) return null;
  // @ts-ignore - Types will regenerate after migration, ciphertext accepts bytea
  const { data, error } = await supabase.rpc('decrypt_emotion_field', {
    ciphertext: field as string, // Cast to string for RPC call
    encryption_key: key
  });
  if (error) {
    console.error('Decryption error:', error);
    return null;
  }
  return (data as string) ?? null;
};

/**
 * Encrypt ALL sensitive emotion data before storing in database
 * Now includes emotion_type and intensity for full protection
 */
export const encryptEmotionData = async (
  emotionType: string,
  intensity: number,
  trigger: string | null,
  copingStrategy: string | null,
  reflectionNotes: string | null
) => {
  const key = await getEncryptionKey();
  
  return {
    // NEW: Encrypt emotion_type and intensity for full protection
    emotion_type_encrypted: await encryptField(emotionType, key),
    intensity_encrypted: await encryptField(String(intensity), key),
    // Existing encrypted fields
    trigger_encrypted: await encryptField(trigger, key),
    coping_strategy_encrypted: await encryptField(copingStrategy, key),
    reflection_notes_encrypted: await encryptField(reflectionNotes, key)
  };
};

/**
 * Decrypt ALL sensitive emotion data when reading from database
 */
export const decryptEmotionData = async (
  emotionTypeEncrypted: unknown,
  intensityEncrypted: unknown,
  triggerEncrypted: unknown,
  copingStrategyEncrypted: unknown,
  reflectionNotesEncrypted: unknown
) => {
  const key = await getEncryptionKey();
  
  const intensityStr = await decryptField(intensityEncrypted, key);
  
  return {
    emotion_type: await decryptField(emotionTypeEncrypted, key),
    intensity: intensityStr ? parseInt(intensityStr, 10) : null,
    trigger: await decryptField(triggerEncrypted, key),
    coping_strategy: await decryptField(copingStrategyEncrypted, key),
    reflection_notes: await decryptField(reflectionNotesEncrypted, key)
  };
};

/**
 * Get safe emotion summary (aggregate only, no details)
 * Uses the SECURITY DEFINER function for parent views
 */
export const getEmotionSummary = async (childId: string) => {
  const { data, error } = await supabase.rpc('get_emotion_summary_for_parent', {
    p_child_id: childId
  });
  
  if (error) {
    console.error('Error fetching emotion summary:', error);
    return [];
  }
  
  return data as { log_date: string; log_count: number }[];
};
