import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

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

const tileWidth = 64;
const tileHeight = 32;

const MapCanvasIsometric: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    class IsoScene extends Phaser.Scene {
      private blockData: Block[] = [];
      private camera!: Phaser.Cameras.Scene2D.Camera;
      private selectedBlock: Phaser.GameObjects.Sprite | null = null;
      private tooltip: Phaser.GameObjects.Container | null = null;
      private highlight!: Phaser.GameObjects.Graphics;

      preload() {
        this.load.image('castillo', castilloImg);
        this.load.image('cofre', cofreImg);
        this.load.image('torre', pastoImg);
        this.load.image('pasto', pastoImg);
        this.load.image('agua', aguaImg);
        this.load.image('bosque', bosqueImg);
        this.load.image('piedra', piedraImg);

        // Cargar el mapa JSON
        this.load.json('world', 'World.json');
      }

      create() {
        this.blockData = this.cache.json.get('world');

        this.camera = this.cameras.main;
        this.camera.setZoom(1);
        this.camera.setBounds(-3000, -3000, 6000, 6000);
        this.camera.centerOn(0, 0);

        // Movimiento con el mouse (drag)
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (pointer.isDown) {
            this.camera.scrollX -= pointer.velocity.x / 5;
            this.camera.scrollY -= pointer.velocity.y / 5;
          }
        });

        // 🎯 Capturar eventos de la rueda del mouse (zoom)
        const wheelHandler = (event: WheelEvent) => {
          if (event.deltaY > 0) {
            this.camera.zoom = Math.max(0.5, this.camera.zoom - 0.1);
          } else {
            this.camera.zoom = Math.min(2, this.camera.zoom + 0.1);
          }
        };

        window.addEventListener("wheel", wheelHandler);

        // Remover evento cuando la escena se destruye
        this.events.on("destroy", () => {
          window.removeEventListener("wheel", wheelHandler);
        });

        // Crear contorno en forma de rombo
        this.highlight = this.add.graphics();
        this.highlight.lineStyle(3, 0xffff00); // Contorno amarillo
        this.highlight.visible = false;
        this.add.existing(this.highlight);

        this.renderBlocks();
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
          if (category === 'Medium') texture = 'cofre';
          if (only === 1) texture = 'agua';
          if (only === 3) texture = 'piedra';
          if (only === 6) texture = 'bosque';

          const sprite = this.add.sprite(isoX, isoY, texture).setOrigin(0.5, 1);

          // Definir área interactiva en forma de rombo para detectar clicks con precisión
          // Calculamos el hitArea en función del tamaño del tile y del sprite
          const hitArea = new Phaser.Geom.Polygon([
            new Phaser.Geom.Point(sprite.width / 2, sprite.height - tileHeight),                  // Vértice superior
            new Phaser.Geom.Point(sprite.width / 2 + tileWidth / 2, sprite.height - tileHeight / 2),  // Vértice derecho
            new Phaser.Geom.Point(sprite.width / 2, sprite.height),                                 // Vértice inferior
            new Phaser.Geom.Point(sprite.width / 2 - tileWidth / 2, sprite.height - tileHeight / 2)   // Vértice izquierdo
          ]);
          sprite.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);

          // 🟢 Evento de clic en el bloque
          sprite.on('pointerdown', () => {
            // Evitar que el mismo bloque siga subiendo
            if (this.selectedBlock === sprite) return;

            // Si hay un bloque seleccionado, volverlo a su posición original
            if (this.selectedBlock) {
              this.tweens.add({
                targets: this.selectedBlock,
                y: this.selectedBlock.y + 10,
                duration: 200,
                ease: 'Power1',
              });
            }

            // Hacer que el bloque seleccionado "salte"
            this.tweens.add({
              targets: sprite,
              y: sprite.y - 10,
              duration: 200,
              ease: 'Power1',
            });

            this.selectedBlock = sprite;

            // Si ya existe el tooltip, destruirlo antes de crear uno nuevo
            if (this.tooltip) this.tooltip.destroy();

            // Crear el tooltip
            this.tooltip = this.add.container(isoX + 50, isoY - 40);
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.8);
            bg.fillRoundedRect(0, 0, 140, 60, 10);

            const text = this.add.text(10, 10, `ID: ${block.blockId}\nSupply: ${block.supplyBlock}`, {
              fontSize: '12px',
              color: '#ffffff',
            });

            this.tooltip.add([bg, text]);
            this.add.existing(this.tooltip);
          });




          sprite.on('pointerover', () => {
            sprite.setTint(0xffff00); // Aplica un tinte amarillo
          });
          
          sprite.on('pointerout', () => {
            sprite.clearTint(); // Quita el tinte al salir el mouse
          });
          

          

          
          
          container.add(sprite);
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
          mode: Phaser.Scale.FIT, // Ajusta el tamaño del juego para que se adapte al contenedor
          autoCenter: Phaser.Scale.CENTER_BOTH // Centra el canvas tanto horizontal como verticalmente
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






