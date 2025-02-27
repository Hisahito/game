// src/components/character.tsx
import { useEffect, useState } from 'react';
import { publicClient } from '../config/client';
import { parseAbi, parseAbiItem, decodeEventLog } from 'viem';

interface CharacterCreatedEvent {
  characterId: string;
  affinity: string;
  velocity: string;
  isNew?: boolean;
}

const eventItem = parseAbi(['event CharacterCreated(uint256 characterId, uint256 affinity, uint256 velocity)']);
const eventItem2 = parseAbiItem('event CharacterCreated(uint256 characterId, uint256 affinity, uint256 velocity)');

const HistoricalCharacterEvents = () => {
  const [events, setEvents] = useState<CharacterCreatedEvent[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const logs = await publicClient.getLogs({
          address: '0x322AE0BEE905572DE3d1F67E2A560c19fbc76994',
          events: eventItem,
          fromBlock: 48628746n,
          toBlock: 'latest',
        });
        console.log(logs);
        console.log(eventItem);
        const eventsData: CharacterCreatedEvent[] = logs.map((log) => {
          const decoded = decodeEventLog({
            abi: eventItem,
            data: log.data,
            topics: log.topics,
          });
          return {
            characterId: decoded.args.characterId.toString(),
            affinity: decoded.args.affinity.toString(),
            velocity: decoded.args.velocity.toString(),
          };
        });
        setEvents(eventsData);
      } catch (error) {
        console.error('Error al obtener los eventos históricos:', error);
      }
    }
    fetchEvents();
  }, [eventItem]);

  useEffect(() => {
    const unwatch = publicClient.watchEvent({
      address: '0x322AE0BEE905572DE3d1F67E2A560c19fbc76994',
      event: eventItem2,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const decoded = decodeEventLog({
            abi: eventItem,
            data: log.data,
            topics: log.topics,
          });
          const newEvent: CharacterCreatedEvent = {
            characterId: decoded.args.characterId.toString(),
            affinity: decoded.args.affinity.toString(),
            velocity: decoded.args.velocity.toString(),
            isNew: true,
          };
          setEvents((prev) => [...prev, newEvent]);
        });
      },
    });

    return () => {
      unwatch();
    };
  }, [eventItem2]);

  return (
    <div>
      <h2>Histórico de CharacterCreated</h2>
      {/* Contenedor para disponer los eventos en fila con scroll horizontal */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              border: event.isNew ? '2px solid red' : '1px solid #ccc',
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: '8px',
              flex: '0 0 auto'
            }}
          >
            <p>
              <strong>ID del Personaje:</strong> {event.characterId}
            </p>
            <p>
              <strong>Affinity:</strong> {event.affinity}
            </p>
            <p>
              <strong>Velocity:</strong> {event.velocity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalCharacterEvents;
