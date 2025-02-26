import React, { useEffect, useState } from 'react';
import { Alchemy, Network,Utils } from 'alchemy-sdk';
import { ethers } from 'ethers';

// Configuración de Alchemy: usa la API key "demo" o reemplázala por la tuya.
const settings = {
  apiKey: 'QPfxbvXMQB4R4OVfa8u1qVp49_cNVHhh', // Reemplaza con tu API Key de Alchemy si lo deseas.
  network: Network.ARBNOVA_MAINNET,
};

const alchemy = new Alchemy(settings);

interface LogEvent {
  transactionHash: string;
  blockNumber: string;
  data: string;
  topics: string[];
}

const TransferEventsListener: React.FC = () => {
  const [events, setEvents] = useState<LogEvent[]>([]);

  useEffect(() => {
    // Filtro para eventos de Transfer del token DAI.
    // La dirección "dai.tokens.ethers.eth" es un ENS que resuelve a la dirección de DAI.
    // Se usa la firma del evento Transfer para generar el topic.
    const filter = {
      address: '0xDF72cf0Ec03d30c3Ce2E409A4c3045F89278B7C7',
      topics: [Utils.id("CharacterCreated(uint256,uint256,uint256)")],
    };

    console.log("Iniciando suscripción con filtro:", filter);

    const handleLog = (log: any, event: any) => {
      console.log("Evento recibido:", log, event);
      setEvents(prev => [...prev, log]);
    };

    // Suscribirse a los logs que coincidan con el filtro
    alchemy.ws.on(filter, (log,event) => {
console.log(log);
    });

    // Limpieza: cancelar la suscripción al desmontar el componente
    return () => {
      alchemy.ws.off(filter, handleLog);
    };
  }, []);

  return (
    <div>
      <h1>Transferencias DAI (Prueba de Concepto)</h1>
      {events.length === 0 && <p>Aún no se han recibido eventos...</p>}
      {events.map((evt, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <p>
            <strong>Hash de Transacción:</strong> {evt.transactionHash}
          </p>
          <p>
            <strong>Número de Bloque:</strong> {parseInt(evt.blockNumber, 16)}
          </p>
          <p>
            <strong>Datos:</strong> {evt.data}
          </p>
          <p>
            <strong>Topics:</strong> {evt.topics.join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TransferEventsListener;



