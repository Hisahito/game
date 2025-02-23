import React, { useEffect, useRef, useState } from 'react';
import { Application, Sprite, Graphics, Text, TextStyle, Container, InteractionEvent } from 'pixi.js';

import castilloImg from '../assets/castillo.png';
import cofreImg from '../assets/cofre.png';
import torreImg from '../assets/torre1.png';
import pastoImg from '../assets/grass.png';
import aguaImg from '../assets/water.png';
import bosqueImg from '../assets/bosque.png';
import piedraImg from '../assets/piedra1.png';

interface Block {
  blockId: number;
  x: number;
  y: number;
  category: string;
  supplyBlock: number;
  afinity: number[];
  only: number;
}

/**
 * Componente MapCanvasIsometric
 *
 * Se carga "World.json" y se renderiza una ventana (viewport) de 10x10 bloques.
 * Si el usuario hace clic en uno de los bloques del borde, se desplaza el viewport
 * (por ejemplo, 3 bloques) para mostrar parte del mapa nuevo.
 */
const MapCanvasIsometric: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockDetails, setBlockDetails] = useState<Block[]>([]);
  // Estado para el viewport: la esquina superior izquierda (en coordenadas de grid)
  const [viewportOrigin, setViewportOrigin] = useState<{ x: number; y: number } | null>(null);

  // Tamaño en bloques del viewport
  const viewportBlockCountX = 20;
  const viewportBlockCountY = 20;
  // Delta para mover el viewport al hacer clic en un borde
  const viewportShiftDelta = 3;

  // Cargar World.json desde public/
  useEffect(() => {
    fetch('World.json')
      .then(response => response.json())
      .then((data: Block[]) => setBlockDetails(data))
      .catch(err => console.error('Error al cargar World.json:', err));
  }, []);

  // Una vez cargado el mapa, establecer el viewport inicial (centrado en el mapa)
  useEffect(() => {
    if (blockDetails.length > 0 && viewportOrigin === null) {
      const allX = blockDetails.map(b => b.x);
      const allY = blockDetails.map(b => b.y);
      const minGridX = Math.min(...allX);
      const maxGridX = Math.max(...allX);
      const minGridY = Math.min(...allY);
      const maxGridY = Math.max(...allY);
      const centerGridX = Math.floor((minGridX + maxGridX) / 2);
      const centerGridY = Math.floor((minGridY + maxGridY) / 2);
      const initialOriginX = centerGridX - Math.floor(viewportBlockCountX / 2);
      const initialOriginY = centerGridY - Math.floor(viewportBlockCountY / 2);
      setViewportOrigin({ x: initialOriginX, y: initialOriginY });
    }
  }, [blockDetails, viewportOrigin, viewportBlockCountX, viewportBlockCountY]);

  // Efecto que renderiza el mapa según el viewport
  useEffect(() => {
    if (blockDetails.length === 0 || viewportOrigin === null) return;

    // Parámetros base para la vista isométrica.
    const tileWidth = 128;
    const tileHeight = 64;

    // Factores para acercar (o superponer) los bloques horizontal y verticalmente
    // Ajusta estos valores para pegar más los bloques en la dirección horizontal
    // y mantener la proporción vertical isométrica.
    const horizontalFactor = 0.3;  // Menor a 0.5 para reducir separación lateral
    const verticalFactor = 0.3;    // 0.5 es típico para isométrico 2:1

    // Calcular los límites del viewport (en coordenadas de grid)
    const visibleMinX = viewportOrigin.x;
    const visibleMaxX = viewportOrigin.x + viewportBlockCountX - 1;
    const visibleMinY = viewportOrigin.y;
    const visibleMaxY = viewportOrigin.y + viewportBlockCountY - 1;

    // Filtrar los bloques que están dentro del viewport
    const visibleBlocks = blockDetails.filter(b =>
      b.x >= visibleMinX && b.x <= visibleMaxX &&
      b.y >= visibleMinY && b.y <= visibleMaxY
    );

    // Definir márgenes para el canvas
    const marginLeftDesired = 100;
    const marginTopDesired = 50;
    const marginRightDesired = 100;
    const marginBottomDesired = 50;

    // Calcular las coordenadas base (isométricas sin margen) de los bloques visibles
    const baseCoords = visibleBlocks.map(block => {
      // Aquí reemplazamos (tileWidth/2) por (tileWidth * horizontalFactor)
      // y (tileHeight/2) por (tileHeight * verticalFactor)
      const baseIsoX = (block.x - block.y) * (tileWidth * horizontalFactor);
      const baseIsoY = (block.x + block.y) * (tileHeight * verticalFactor);
      return { baseIsoX, baseIsoY };
    });

    // Caja delimitadora de las coordenadas isométricas visibles.
    const minIsoX = Math.min(...baseCoords.map(c => c.baseIsoX));
    const maxIsoX = Math.max(...baseCoords.map(c => c.baseIsoX));
    const minIsoY = Math.min(...baseCoords.map(c => c.baseIsoY));
    const maxIsoY = Math.max(...baseCoords.map(c => c.baseIsoY));

    // Offset para centrar los bloques en el canvas
    const offsetX = marginLeftDesired - minIsoX;
    const offsetY = marginTopDesired - minIsoY;

    // Tamaño del canvas según la caja delimitadora y los márgenes
    const appWidth = (maxIsoX - minIsoX) + marginLeftDesired + marginRightDesired;
    const appHeight = (maxIsoY - minIsoY) + marginTopDesired + marginBottomDesired;

    // Función para convertir coordenadas de grid a isométricas con offset
    const toIso = (gridX: number, gridY: number) => {
      const baseIsoX = (gridX - gridY) * (tileWidth * horizontalFactor);
      const baseIsoY = (gridX + gridY) * (tileHeight * verticalFactor);
      return { isoX: baseIsoX + offsetX, isoY: baseIsoY + offsetY };
    };

    const container = containerRef.current;
    const app = new Application({
      width: appWidth,
      height: appHeight,
      backgroundColor: 0xf0f0f0,
    });
    app.stage.sortableChildren = true;
    if (container) {
      container.appendChild(app.view as unknown as Node);
    }
    // Guardamos la referencia al canvas antes de destruir la app en cleanup.
    const viewRef = app.view;

    // Pre-cargar texturas para bloques especiales.
    const textures: { [key: string]: PIXI.Texture } = {
      Legendary: Sprite.from(castilloImg).texture,
      High: Sprite.from(torreImg).texture,
      Medium: Sprite.from(cofreImg).texture,
    };

    // Texturas para bloques "Normal" según la propiedad "only".
    const normalTextures: { [key: number]: PIXI.Texture } = {
      0: Sprite.from(pastoImg).texture,
      1: Sprite.from(aguaImg).texture,
      3: Sprite.from(piedraImg).texture,
      6: Sprite.from(bosqueImg).texture,
    };

    // Crear tooltip
    const tooltipContainer = new Container();
    tooltipContainer.visible = false;
    tooltipContainer.zIndex = 1000;
    app.stage.addChild(tooltipContainer);
    const tooltipBg = new Graphics();
    tooltipBg.beginFill(0x000000, 0.7);
    tooltipBg.drawRoundedRect(0, 0, 160, 80, 5);
    tooltipBg.endFill();
    tooltipContainer.addChild(tooltipBg);
    const tooltipText = new Text('', new TextStyle({
      fontSize: 12,
      fill: '#ffffff',
      wordWrap: true,
      wordWrapWidth: 150,
    }));
    tooltipText.x = 5;
    tooltipText.y = 5;
    tooltipContainer.addChild(tooltipText);

    let currentHighlight: Graphics | null = null;

    // Función para mostrar tooltip
    const showTooltip = (block: Block, posX: number, posY: number) => {
      tooltipText.text = `ID: ${block.blockId}\nSupply: ${block.supplyBlock}\nCategoría: ${block.category}\nAfinity: ${block.afinity.join(', ')}\nOnly: ${block.only}`;
      tooltipContainer.x = posX - tooltipBg.width / 2;
      tooltipContainer.y = posY - tooltipBg.height - 10;
      tooltipContainer.visible = true;
    };

    // Función para marcar bloque seleccionado
    const markBlock = (posX: number, posY: number) => {
      if (currentHighlight) {
        currentHighlight.destroy();
        currentHighlight = null;
      }
      currentHighlight = new Graphics();
      currentHighlight.lineStyle(3, 0xffff00);
      currentHighlight.drawPolygon([
        posX, posY - tileHeight / 2,
        posX + tileWidth / 2, posY,
        posX, posY + tileHeight / 2,
        posX - tileWidth / 2, posY,
      ]);
      currentHighlight.zIndex = 999;
      app.stage.addChild(currentHighlight);
    };

    // Al hacer clic en el stage se ocultan tooltip y highlight
    app.stage.interactive = true;
    app.stage.on('pointerdown', () => {
      tooltipContainer.visible = false;
      if (currentHighlight) {
        currentHighlight.destroy();
        currentHighlight = null;
      }
    });

    // Valores globales del mapa para no exceder los límites al mover el viewport
    const allX = blockDetails.map(b => b.x);
    const allY = blockDetails.map(b => b.y);
    const minGridX = Math.min(...allX);
    const maxGridX = Math.max(...allX);
    const minGridY = Math.min(...allY);
    const maxGridY = Math.max(...allY);

    // Función que maneja el clic en un bloque: muestra tooltip, highlight y mueve el viewport si es borde.
    const onBlockClick = (e: InteractionEvent, posX: number, posY: number, block: Block) => {
      e.stopPropagation();
      showTooltip(block, posX, posY);
      markBlock(posX, posY);

      // Borde derecho:
      if (block.x === visibleMaxX) {
        const newOriginX = Math.min(maxGridX - viewportBlockCountX + 1, viewportOrigin.x + viewportShiftDelta);
        if (newOriginX !== viewportOrigin.x) {
          setViewportOrigin({ x: newOriginX, y: viewportOrigin.y });
        }
      }
      // Borde izquierdo:
      if (block.x === visibleMinX) {
        const newOriginX = Math.max(minGridX, viewportOrigin.x - viewportShiftDelta);
        if (newOriginX !== viewportOrigin.x) {
          setViewportOrigin({ x: newOriginX, y: viewportOrigin.y });
        }
      }
      // Borde inferior:
      if (block.y === visibleMaxY) {
        const newOriginY = Math.min(maxGridY - viewportBlockCountY + 1, viewportOrigin.y + viewportShiftDelta);
        if (newOriginY !== viewportOrigin.y) {
          setViewportOrigin({ x: viewportOrigin.x, y: newOriginY });
        }
      }
      // Borde superior:
      if (block.y === visibleMinY) {
        const newOriginY = Math.max(minGridY, viewportOrigin.y - viewportShiftDelta);
        if (newOriginY !== viewportOrigin.y) {
          setViewportOrigin({ x: viewportOrigin.x, y: newOriginY });
        }
      }
    };

    // Renderizar cada bloque visible
    visibleBlocks.forEach(block => {
      const { isoX, isoY } = toIso(block.x, block.y);
      if (block.category === 'Legendary' || block.category === 'High' || block.category === 'Medium') {
        const sprite = new Sprite(textures[block.category]);
        sprite.anchor.set(0.5, 1);
        sprite.x = isoX;
        sprite.y = isoY;
        sprite.width = tileWidth;
        sprite.height = tileHeight * 2;
        sprite.interactive = true;
        (sprite as any).buttonMode = true;
        sprite.on('pointerdown', (e: InteractionEvent) => onBlockClick(e, sprite.x, sprite.y, block));
        app.stage.addChild(sprite);
      } else {
        const texture = normalTextures[block.only] || normalTextures[0];
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.x = isoX;
        sprite.y = isoY;
        sprite.width = tileWidth;
        sprite.height = tileHeight;
        sprite.interactive = true;
        (sprite as any).buttonMode = true;
        sprite.on('pointerdown', (e: InteractionEvent) => onBlockClick(e, isoX, isoY, block));
        app.stage.addChild(sprite);
      }
    });

    // Cleanup: remover el canvas del DOM y destruir la aplicación
    return () => {
      if (container && viewRef && viewRef.parentNode) {
        container.removeChild(viewRef);
      }
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    };
  }, [
    blockDetails,
    viewportOrigin,
    viewportBlockCountX,
    viewportBlockCountY,
    viewportShiftDelta
  ]);

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
};

export default MapCanvasIsometric;
