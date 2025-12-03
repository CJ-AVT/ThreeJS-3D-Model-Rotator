import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera, WebGLRenderer } from 'three';
import type { AppConfig } from '../types/types';

interface ControlsProps {
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  config: AppConfig;
  onControlsReady: (controls: OrbitControls) => void;
}

export default function Controls({ camera, renderer, config, onControlsReady }: ControlsProps) {
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = config.settings.autoRotate;
    controls.autoRotateSpeed = config.settings.rotateSpeed;
    controls.enabled = config.settings.enableControls ?? true;
    controlsRef.current = controls;

    onControlsReady(controls);

    return () => {
      controls.dispose();
    };
  }, [camera, renderer, config, onControlsReady]);

  return null;
}

