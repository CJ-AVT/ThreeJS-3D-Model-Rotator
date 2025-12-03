import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Scene } from 'three';
import type { AppConfig } from '@/types/types';

interface HotspotManagerProps {
  scene: Scene;
  config: AppConfig;
  onHotspotsReady: (hotspots: (THREE.Mesh | THREE.Sprite)[]) => void;
}

// Helper function to create a canvas-based text sprite
function createNumberSprite(number: number, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d')!;
  
  // Draw circle background
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2 - 4, 0, 2 * Math.PI);
  context.fill();
  
  // Draw border
  context.strokeStyle = color;
  context.lineWidth = 4;
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2 - 4, 0, 2 * Math.PI);
  context.stroke();
  
  // Draw number
  context.fillStyle = '#1f2937';
  context.font = 'bold 64px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(number.toString(), size / 2, size / 2);
  
  // Create sprite
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.3, 0.3, 1);
  
  return sprite;
}

export default function HotspotManager({
  scene,
  config,
  onHotspotsReady,
}: HotspotManagerProps) {
  const hotspotsRef = useRef<(THREE.Mesh | THREE.Sprite)[]>([]);
  const meshHotspotsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    // Remove existing hotspots
    hotspotsRef.current.forEach((hotspot) => {
      if (hotspot instanceof THREE.Sprite && hotspot.material.map) {
        hotspot.material.map.dispose();
      }
      if (hotspot.material) {
        hotspot.material.dispose();
      }
      if (hotspot instanceof THREE.Mesh && hotspot.geometry) {
        hotspot.geometry.dispose();
      }
      scene.remove(hotspot);
    });
    hotspotsRef.current = [];
    meshHotspotsRef.current = [];

    config.settings.hotspots.forEach((hotspotConfig, index) => {
      if (config.settings.numberHotspots) {
        // Create number sprite instead of hotspot mesh
        const numberSprite = createNumberSprite(index + 1, hotspotConfig.color);
        numberSprite.position.set(
          hotspotConfig.position.x,
          hotspotConfig.position.y,
          hotspotConfig.position.z
        );
        // Make sprite larger when it replaces the hotspot
        numberSprite.scale.set(0.3, 0.3, 1);
        scene.add(numberSprite);
        hotspotsRef.current.push(numberSprite);
      } else {
        // Create regular hotspot mesh
        let geometry: THREE.BufferGeometry;

        switch (hotspotConfig.shape) {
          case 'box':
            geometry = new THREE.BoxGeometry(
              hotspotConfig.size,
              hotspotConfig.size,
              hotspotConfig.size
            );
            break;
          case 'sphere':
          default:
            geometry = new THREE.SphereGeometry(hotspotConfig.size, 16, 16);
            break;
        }

        const material = new THREE.MeshStandardMaterial({
          color: hotspotConfig.color,
          emissive: hotspotConfig.color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8,
        });

        const hotspot = new THREE.Mesh(geometry, material);
        hotspot.position.set(
          hotspotConfig.position.x,
          hotspotConfig.position.y,
          hotspotConfig.position.z
        );

        scene.add(hotspot);
        hotspotsRef.current.push(hotspot);
        meshHotspotsRef.current.push(hotspot);
      }
    });

    onHotspotsReady(hotspotsRef.current);

    // Animate pulsating hotspots (only for mesh hotspots, not numbered sprites)
    const animateHotspots = () => {
      if (!config.settings.numberHotspots) {
        meshHotspotsRef.current.forEach((hotspot, index) => {
          if (config.settings.hotspots[index]?.pulsate) {
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            hotspot.scale.set(scale, scale, scale);
          }
        });
      }
    };

    const intervalId = setInterval(animateHotspots, 16); // ~60fps

    return () => {
      clearInterval(intervalId);
      hotspotsRef.current.forEach((hotspot) => {
        if (hotspot instanceof THREE.Sprite && hotspot.material.map) {
          hotspot.material.map.dispose();
        }
        if (hotspot.material) {
          hotspot.material.dispose();
        }
        if (hotspot instanceof THREE.Mesh && hotspot.geometry) {
          hotspot.geometry.dispose();
        }
        scene.remove(hotspot);
      });
    };
  }, [scene, config, onHotspotsReady]);

  return null;
}

