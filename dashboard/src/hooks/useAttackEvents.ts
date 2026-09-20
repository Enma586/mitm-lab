import { useEffect, useRef, useState } from "react";
import { AttackEvent } from "../domain/AttackEvent";
import { EventsService } from "../services/EventsService";
import { ConnectionStatus, RealtimeEventSource } from "../services/RealtimeEventSource";

const MAX_EVENTS_IN_MEMORY = 300;

interface UseAttackEventsResult {
  events: AttackEvent[];
  status: ConnectionStatus;
  error: string | null;
  refetch: () => void;
}

/**
 * Trae el historial por REST una vez, y despues se engancha al
 * WebSocket para ir agregando eventos nuevos en vivo. No conoce fetch
 * ni WebSocket directamente: recibe las abstracciones por parametro.
 */
export function useAttackEvents(
  eventsService: EventsService,
  realtimeSource: RealtimeEventSource
): UseAttackEventsResult {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set());

  const appendEvent = (event: AttackEvent) => {
    if (knownIds.current.has(event.id)) return;
    knownIds.current.add(event.id);

    setEvents((previous) => {
      const next = [...previous, event];
      if (next.length > MAX_EVENTS_IN_MEMORY) {
        const removed = next.splice(0, next.length - MAX_EVENTS_IN_MEMORY);
        removed.forEach((old) => knownIds.current.delete(old.id));
      }
      return next;
    });
  };

  const fetchHistory = (onCancelled: () => boolean) => {
    eventsService
      .listRecent()
      .then((history) => {
        if (onCancelled()) return;
        history.forEach((event) => knownIds.current.add(event.id));
        setEvents(history.slice(-MAX_EVENTS_IN_MEMORY));
        setError(null);
      })
      .catch((err) => {
        if (!onCancelled()) setError(err instanceof Error ? err.message : "No se pudo cargar el historial");
      });
  };

  useEffect(() => {
    let cancelled = false;
    fetchHistory(() => cancelled);

    const disconnect = realtimeSource.connect({
      onEvent: appendEvent,
      onStatusChange: setStatus,
    });

    return () => {
      cancelled = true;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsService, realtimeSource]);

  const refetch = () => fetchHistory(() => false);

  return { events, status, error, refetch };
}
