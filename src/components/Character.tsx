import { useEffect, useState,useMemo } from 'react'
import { publicClient } from '../config/client'
import { parseAbi,parseAbiItem, decodeEventLog } from 'viem'

interface CharacterCreatedEvent {
  characterId: string
  affinity: string
  velocity: string
  isNew?: boolean
}


// Definimos el evento usando parseAbiItem
const eventItem = parseAbi([
    'event CharacterCreated(uint256 characterId, uint256 affinity, uint256 velocity)']
  )

  const eventItem2= parseAbiItem(
    'event CharacterCreated(uint256 characterId, uint256 affinity, uint256 velocity)'
  )

const HistoricalCharacterEvents = () => {
  const [events, setEvents] = useState<CharacterCreatedEvent[]>([])

  

  

  // Carga histórica de eventos
  useEffect(() => {
    async function fetchEvents() {
      try {
        const logs = await publicClient.getLogs({
          address: '0xDF72cf0Ec03d30c3Ce2E409A4c3045F89278B7C7',
          fromBlock: 82450941n,
          toBlock: 'latest',
        })

        const eventsData: CharacterCreatedEvent[] = logs.map((log) => {
          const decoded = decodeEventLog({
            abi: eventItem,
            data: log.data,
            topics: log.topics,
          })
          return {
            characterId: decoded.args.characterId.toString(),
            affinity: decoded.args.affinity.toString(),
            velocity: decoded.args.velocity.toString(),
          }
        })

        setEvents(eventsData)
      } catch (error) {
        console.error('Error al obtener los eventos históricos:', error)
      }
    }
    fetchEvents()
  }, [eventItem])

  // Suscripción a nuevos eventos
  useEffect(() => {
    const unwatch = publicClient.watchEvent({
      address: '0xDF72cf0Ec03d30c3Ce2E409A4c3045F89278B7C7',
      event: eventItem2,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const decoded = decodeEventLog({
            abi: eventItem,
            data: log.data,
            topics: log.topics,
          })
          const newEvent: CharacterCreatedEvent = {
            characterId: decoded.args.characterId.toString(),
            affinity: decoded.args.affinity.toString(),
            velocity: decoded.args.velocity.toString(),
            isNew: true,
          }
          setEvents((prev) => [...prev, newEvent])
        })
      },
    })

    return () => {
      unwatch()
    }
  }, [eventItem2])

  return (
    <div>
      <h2>Histórico de CharacterCreated</h2>
      {events.map((event, index) => (
        <div
          key={index}
          style={{
            border: event.isNew ? '2px solid red' : '1px solid #ccc',
            margin: '1rem',
            padding: '1rem',
            borderRadius: '8px',
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
  )
}

export default HistoricalCharacterEvents





