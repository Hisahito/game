import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';


import { 
    type BaseError,
    useWaitForTransactionReceipt, 
    useWriteContract 
  } from 'wagmi'
  import  abi  from '../abi/TimeMachine.json'

import castilloImg from '../assets/castillo.png';
import cofreImg from '../assets/cofre.png';
import pastoImg from '../assets/grass.png';
import aguaImg from '../assets/water.png';
import bosqueImg from '../assets/bosque.png';
import piedraImg from '../assets/piedra1.png';
import woodsImg from '../assets/blockWoods.png';
import soldierIdle from '../assets/Soldier-Idle.png'; // Sprite del personaje
import rockImg from '../assets/BlockRock1.png';

interface Block {
  blockId: number;
  x: number;
  y: number;
  category: string;
  supplyBlock: number;
  afinity: number[];
  only: number;
}

// El JSON de personajes ahora solo tiene characterId y blockId.
interface Character {
  characterId: number;
  blockId: number;
}

const tileWidth = 64;
const tileHeight = 32;









const MapCanvasIsometric: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);


  const { 
    data: hash,
    error,
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    // Obtiene los valores de affinity y velocity desde el formulario
    const characterId = formData.get('characterId') as string 
    const blockId = formData.get('blockId') as string 
    writeContract({
      address: '0x322AE0BEE905572DE3d1F67E2A560c19fbc76994',
      abi,
      functionName: 'conquest',
      args: [BigInt(characterId), BigInt(blockId),true],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

    
  useEffect(() => {
    if (!gameContainerRef.current) return;

    class IsoScene extends Phaser.Scene {
      private blockData: Block[] = [];
      private charactersData: Character[] = [];
      // Mapa para asociar cada blockId con su sprite de personaje
      private charactersMap: Map<number, Phaser.GameObjects.Sprite> = new Map();
      private camera!: Phaser.Cameras.Scene2D.Camera;
      private selectedBlock: Phaser.GameObjects.Sprite | null = null;
      private tooltip: Phaser.GameObjects.Container | null = null;
      private highlight!: Phaser.GameObjects.Graphics;

      preload() {
        this.load.image('castillo', castilloImg);
        this.load.image('cofre', bosqueImg);
        this.load.image('torre', pastoImg);
        this.load.image('pasto', pastoImg);
        this.load.image('agua', aguaImg);
        this.load.image('bosque', woodsImg);
        this.load.image('piedra', rockImg);
        this.load.image('woods', woodsImg);

        // Cargar el JSON del mapa y de personajes
        this.load.json('world', 'World.json');
        this.load.json('characters', 'Characters.json');

        // Cargar el sprite sheet del personaje (6 frames de 100x100)
        this.load.spritesheet('soldierIdle', soldierIdle, { frameWidth: 100, frameHeight: 100 });
      }

      create() {
        this.blockData = this.cache.json.get('world');
        this.charactersData = this.cache.json.get('characters');

        this.camera = this.cameras.main;
        this.camera.setZoom(1);
        this.camera.setBounds(-3000, -3000, 6000, 6000);
        this.camera.centerOn(0, 0);

        // Crear animación idle para el personaje
        this.anims.create({
          key: 'idle',
          frames: this.anims.generateFrameNumbers('soldierIdle', { start: 0, end: 5 }),
          frameRate: 6,
          repeat: -1
        });

        // Movimiento con el mouse (drag)
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (pointer.isDown) {
            this.camera.scrollX -= pointer.velocity.x / 5;
            this.camera.scrollY -= pointer.velocity.y / 5;
          }
        });

        // Evento de zoom con la rueda del mouse
        const wheelHandler = (event: WheelEvent) => {
          if (event.deltaY > 0) {
            this.camera.zoom = Math.max(0.5, this.camera.zoom - 0.1);
          } else {
            this.camera.zoom = Math.min(2, this.camera.zoom + 0.1);
          }
        };
        window.addEventListener("wheel", wheelHandler);
        this.events.on("destroy", () => {
          window.removeEventListener("wheel", wheelHandler);
        });

        // Crear contorno en forma de rombo
        this.highlight = this.add.graphics();
        this.highlight.lineStyle(3, 0xffff00);
        this.highlight.visible = false;
        this.add.existing(this.highlight);

        // Renderizar bloques y personajes
        this.renderBlocks();
        this.renderCharacters();
      }

      renderBlocks() {
        const container = this.add.container();
        const spacingFactorX = 0.3;
        const spacingFactorY = 0.3;

        this.blockData.forEach((block) => {
          const { x, y, category, only } = block;
          const isoX = (x - y) * (tileWidth * spacingFactorX);
          const isoY = (x + y) * (tileHeight * spacingFactorY);

          let texture = 'pasto';
          if (category === 'Legendary') texture = 'castillo';
          if (category === 'High') texture = 'torre';
          if (category === 'Medium') texture = 'agua';
          if (only === 1) texture = 'agua';
          if (only === 3) texture = 'woods';
          if (only === 6) texture = 'woods';

          const sprite = this.add.sprite(isoX, isoY, texture).setOrigin(0.5, 1);
          // Guardamos el blockId en el sprite para usarlo después
          sprite.setData("blockId", block.blockId);

          // Definir área interactiva en forma de rombo para detectar clicks
          const hitArea = new Phaser.Geom.Polygon([
            new Phaser.Geom.Point(sprite.width / 2, sprite.height - tileHeight),
            new Phaser.Geom.Point(sprite.width / 2 + tileWidth / 2, sprite.height - tileHeight / 2),
            new Phaser.Geom.Point(sprite.width / 2, sprite.height),
            new Phaser.Geom.Point(sprite.width / 2 - tileWidth / 2, sprite.height - tileHeight / 2)
          ]);
          sprite.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);

          sprite.on('pointerdown', () => {
            // Si ya está seleccionado, no hacemos nada
            if (this.selectedBlock === sprite) return;

            // Si hay un bloque previamente seleccionado, lo regresamos a su posición original junto con su personaje
            if (this.selectedBlock) {
              this.tweens.add({
                targets: this.selectedBlock,
                y: this.selectedBlock.y + 10,
                duration: 200,
                ease: 'Power1'
              });
              const prevBlockId = this.selectedBlock.getData("blockId");
              const prevSoldier = this.charactersMap.get(prevBlockId);
              if (prevSoldier) {
                this.tweens.add({
                  targets: prevSoldier,
                  y: prevSoldier.y + 10,
                  duration: 200,
                  ease: 'Power1'
                });
              }
            }

            // Animar el bloque clickeado: se sube 10px
            this.tweens.add({
              targets: sprite,
              y: sprite.y - 10,
              duration: 200,
              ease: 'Power1'
            });
            // Animar también el sprite del personaje asociado, si existe
            const blockId = sprite.getData("blockId");
            const soldier = this.charactersMap.get(blockId);
            if (soldier) {
              this.tweens.add({
                targets: soldier,
                y: soldier.y - 10,
                duration: 200,
                ease: 'Power1'
              });
            }

            this.selectedBlock = sprite;

            // Mostrar tooltip (puedes ajustar su posición según convenga)
            if (this.tooltip) this.tooltip.destroy();
            const isoX = sprite.x;
            const isoY = sprite.y;
            this.tooltip = this.add.container(isoX + 50, isoY - 40);
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.8);
            bg.fillRoundedRect(0, 0, 200, 60, 10);
            const text = this.add.text(10, 10, `ID: ${sprite.getData("blockId")}\nSupply: ${block.supplyBlock}`, {
              fontSize: '12px',
              color: '#ffffff',
            });
            this.tooltip.add([bg, text]);
            this.add.existing(this.tooltip);
          });

          sprite.on('pointerover', () => {
            sprite.setTint(0xffff00);
          });
          sprite.on('pointerout', () => {
            sprite.clearTint();
          });

          container.add(sprite);
        });
      }

      renderCharacters() {
        const spacingFactorX = 0.3;
        const spacingFactorY = 0.3;

        // Para cada personaje, se busca el bloque correspondiente y se añade el sprite del personaje
        this.charactersData.forEach((character: Character) => {
          const block = this.blockData.find(b => b.blockId === character.blockId);
          if (!block) return; // Si no se encuentra el bloque, se omite

          // Calcula la posición isométrica del bloque
          const isoX = (block.x - block.y) * (tileWidth * spacingFactorX);
          const isoY = (block.x + block.y) * (tileHeight * spacingFactorY);

          // Se añade un ajuste en Y (por ejemplo, +10) para posicionar correctamente el personaje
          const posX = isoX;
          const posY = isoY + 20;

          // Crear el sprite del personaje y reproducir la animación idle
          const soldier = this.add.sprite(posX, posY, 'soldierIdle').setOrigin(0.5, 1);
          soldier.play('idle');
          soldier.setDepth(posY);

          // Guardar el sprite en el mapa, usando blockId como clave
          this.charactersMap.set(block.blockId, soldier);
        });
      }
    }

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1200,
      height: 800,
      backgroundColor: '#87CEEB',
      parent: gameContainerRef.current!,
      scene: IsoScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        
      },
      render: {
        antialias: true,
        pixelArt: true,
      },
      physics: {
        default: 'arcade',
      },
    });

    setGame(phaserGame);

    return () => {
      phaserGame.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};

export default MapCanvasIsometric;


