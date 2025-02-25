// HistoricalCharacterEvents.tsx
import { useEffect, useState } from 'react'
import { parseEventLogs } from 'viem'
import { publicClient } from '../config/client'
import abi from '../abi/TimeMachine.json'

interface CharacterCreatedEvent {
  characterId: string
  affinity: string
  velocity: string
}

// Define la estructura que esperamos para el log decodificado
interface ParsedCharacterCreatedLog {
  args: {
    characterId: bigint | string
    affinity: bigint | string
    velocity: bigint | string
  }
  eventName: string
  logIndex: number
  // Puedes agregar más campos si los requieres
}

const HistoricalCharacterEvents = () => {
  const [events, setEvents] = useState<CharacterCreatedEvent[]>([])

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Consulta los logs históricos desde el bloque 0 hasta el último bloque
        const logs = await publicClient.getLogs({
          address: '0x6A8c8abA55783dB59815B0213C8392E870Fb816c', // Reemplaza con la dirección de tu smart contract
          fromBlock: 48574331n,
          toBlock: 'latest',
        })

        // Decodifica los logs para filtrar el evento "CharacterCreated"
        // Realizamos una aserción de tipo para indicarle a TypeScript que cada log tendrá la propiedad args
        const parsedLogs = parseEventLogs({
          abi,
          eventName: 'CharacterCreated',
          logs,
        }) as ParsedCharacterCreatedLog[]

        // Mapea los logs decodificados para extraer la información requerida
        const eventsData: CharacterCreatedEvent[] = parsedLogs.map((log) => ({
          characterId: log.args.characterId.toString(),
          affinity: log.args.affinity.toString(),
          velocity: log.args.velocity.toString(),
        }))

        setEvents(eventsData)
      } catch (error) {
        console.error('Error al obtener los eventos históricos:', error)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div>
      <h2>Histórico de CharacterCreated</h2>
      {events.map((event, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
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



