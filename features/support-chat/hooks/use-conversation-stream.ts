import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupportMessageWithSender } from '../types';

interface SSEEvent {
  type: 'connected' | 'initial-messages' | 'new-message' | 'heartbeat' | 'error';
  data: any;
}

interface UseConversationStreamOptions {
  conversationId: string;
  enabled?: boolean;
  onMessage?: (message: SupportMessageWithSender) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseConversationStreamReturn {
  messages: SupportMessageWithSender[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastHeartbeat: Date | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useConversationStream({
  conversationId,
  enabled = true,
  onMessage,
  onError,
  onConnect,
  onDisconnect
}: UseConversationStreamOptions): UseConversationStreamReturn {
  const [messages, setMessages] = useState<SupportMessageWithSender[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayRef = useRef(1000); // Start with 1 second

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const connect = useCallback(() => {
    if (!enabled || !conversationId || eventSourceRef.current) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const eventSource = new EventSource(`/api/conversations/${conversationId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000; // Reset delay
        onConnect?.();
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        setIsConnecting(false);
        
        const errorMessage = 'Connection to chat server lost';
        setError(errorMessage);
        onError?.(errorMessage);

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000); // Max 30 seconds
            eventSource.close();
            eventSourceRef.current = null;
            connect();
          }, reconnectDelayRef.current);
        } else {
          setError('Unable to connect to chat server. Please refresh the page.');
        }
      };

      // Handle different event types
      eventSource.addEventListener('connected', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          console.log('SSE connected:', data);
        } catch (error) {
          console.error('Error parsing connected event:', error);
        }
      });

      eventSource.addEventListener('initial-messages', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          setMessages(data.messages || []);
        } catch (error) {
          console.error('Error parsing initial messages:', error);
        }
      });

      eventSource.addEventListener('new-message', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          const newMessage = data.message;
          
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            
            // Add new message and sort by creation time
            return [...prev, newMessage].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

          onMessage?.(newMessage);
        } catch (error) {
          console.error('Error parsing new message:', error);
        }
      });

      eventSource.addEventListener('heartbeat', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          setLastHeartbeat(new Date(data.timestamp));
        } catch (error) {
          console.error('Error parsing heartbeat:', error);
        }
      });

      eventSource.addEventListener('error', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          const errorMessage = data.message || 'Unknown server error';
          setError(errorMessage);
          onError?.(errorMessage);
        } catch (error) {
          console.error('Error parsing error event:', error);
        }
      });

    } catch (error) {
      console.error('Error creating EventSource:', error);
      setIsConnecting(false);
      setError('Failed to initialize chat connection');
    }
  }, [conversationId, enabled, onConnect, onError, onMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = 1000;
    setTimeout(connect, 100); // Small delay before reconnecting
  }, [connect, disconnect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled && conversationId) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [conversationId, enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Handle page visibility changes (reconnect when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && !isConnected && !isConnecting) {
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, isConnected, isConnecting, reconnect]);

  return {
    messages,
    isConnected,
    isConnecting,
    error,
    lastHeartbeat,
    reconnect,
    disconnect
  };
}