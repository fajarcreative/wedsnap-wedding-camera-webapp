import { ChatMessage } from '../types';

// KVdb bucket ID for WedSnap Fajar & Aulia wedding
const KVDB_BUCKET = 'Y7gJBLFvpHTuzkV1xqY5gr';
const KVDB_ENDPOINT = `https://kvdb.io/${KVDB_BUCKET}/chat_messages`;

// ntfy.sh public real-time SSE channel
const NTFY_TOPIC = 'wedsnap-fajar-aulia-chat-live';
const NTFY_PUBLISH_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
const NTFY_SSE_URL = `https://ntfy.sh/${NTFY_TOPIC}/sse`;

export interface RealtimePayload {
  type: 'NEW_MESSAGE' | 'REACTION';
  payload: any;
}

/**
 * Fetch all chat messages from the persistent cloud database
 */
export async function fetchRemoteMessages(): Promise<ChatMessage[] | null> {
  try {
    const res = await fetch(`${KVDB_ENDPOINT}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (e) {
    console.warn('fetchRemoteMessages warning:', e);
    return null;
  }
}

/**
 * Persist the entire chat array to the cloud database
 */
export async function persistRemoteMessages(messages: ChatMessage[]): Promise<boolean> {
  try {
    const res = await fetch(KVDB_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages)
    });
    return res.ok;
  } catch (e) {
    console.warn('persistRemoteMessages warning:', e);
    return false;
  }
}

/**
 * Broadcast a new message in real-time to all connected guest phones
 */
export async function broadcastNewMessage(message: ChatMessage): Promise<void> {
  try {
    const payload: RealtimePayload = {
      type: 'NEW_MESSAGE',
      payload: message
    };
    await fetch(NTFY_PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('broadcastNewMessage warning:', e);
  }
}

/**
 * Broadcast a reaction update in real-time
 */
export async function broadcastReaction(messageId: string, emoji: string): Promise<void> {
  try {
    const payload: RealtimePayload = {
      type: 'REACTION',
      payload: { messageId, emoji }
    };
    await fetch(NTFY_PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('broadcastReaction warning:', e);
  }
}

/**
 * Subscribe to real-time incoming messages and reactions via Server-Sent Events (SSE)
 */
export function subscribeToRealtimeChat(
  onNewMessage: (msg: ChatMessage) => void,
  onReaction: (messageId: string, emoji: string) => void
): () => void {
  let es: EventSource | null = null;

  try {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      es = new EventSource(NTFY_SSE_URL);

      es.onmessage = (event) => {
        try {
          if (!event.data) return;
          const ntfyData = JSON.parse(event.data);
          if (ntfyData && ntfyData.message) {
            const parsed: RealtimePayload = JSON.parse(ntfyData.message);
            if (parsed.type === 'NEW_MESSAGE' && parsed.payload) {
              onNewMessage(parsed.payload);
            } else if (parsed.type === 'REACTION' && parsed.payload) {
              onReaction(parsed.payload.messageId, parsed.payload.emoji);
            }
          }
        } catch {
          // Ignore keep-alive or ping packets
        }
      };

      es.onerror = () => {
        // Browser automatically attempts reconnect on error
      };
    }
  } catch (err) {
    console.warn('Real-time SSE subscription error:', err);
  }

  return () => {
    if (es) {
      es.close();
      es = null;
    }
  };
}

