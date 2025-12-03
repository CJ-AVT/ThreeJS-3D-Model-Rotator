import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Scene } from 'three';
import type { AppConfig } from '../types/types';

interface HotspotManagerProps {
  scene: Scene;
  config: AppConfig;
  onHotspotsReady: (hotspots: THREE.Mesh[]) => void;
}

export default function HotspotManager({
  scene,
  config,
  onHotspotsReady,
}: HotspotManagerProps) {
  const hotspotsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    // Remove existing hotspots
    hotspotsRef.current.forEach((hotspot) => scene.remove(hotspot));
    hotspotsRef.current = [];

    config.settings.hotspots.forEach((hotspotConfig, index) => {
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

      // Add numbering if enabled
      if (config.settings.numberHotspots) {
        // Create text sprite for numbering (simplified - could use TextGeometry for 3D text)
        // For now, we'll store the number in userData
        hotspot.userData.hotspotNumber = index + 1;
      }

      scene.add(hotspot);
      hotspotsRef.current.push(hotspot);
    });

    onHotspotsReady(hotspotsRef.current);

    // Animate pulsating hotspots
    const animateHotspots = () => {
      hotspotsRef.current.forEach((hotspot, index) => {
        if (config.settings.hotspots[index]?.pulsate) {
          const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
          hotspot.scale.set(scale, scale, scale);
        }
      });
    };

    const intervalId = setInterval(animateHotspots, 16); // ~60fps

    return () => {
      clearInterval(intervalId);
      hotspotsRef.current.forEach((hotspot) => scene.remove(hotspot));
    };
  }, [scene, config, onHotspotsReady]);

  return null;
}

