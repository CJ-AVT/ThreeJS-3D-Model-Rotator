import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { AppConfig } from '../types/types';

interface RendererProps {
  mountRef: React.RefObject<HTMLDivElement>;
  config: AppConfig;
  onRendererReady: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;
}

export default function Renderer({ mountRef, config, onRendererReady }: RendererProps) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current || initializedRef.current) return;

    // Cleanup existing renderer if it exists
    if (rendererRef.current) {
      if (mountRef.current && rendererRef.current.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // Element might already be removed
        }
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.theme.backgroundColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = config.assets.cameraDistance;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    initializedRef.current = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Notify parent that renderer is ready (only once)
    onRendererReady(renderer, scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      initializedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        if (mountRef.current && rendererRef.current.domElement) {
          try {
            mountRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {
            // Element might already be removed
          }
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        // Dispose of all geometries and materials in the scene
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => mat.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
        sceneRef.current = null;
      }
    };
  }, [mountRef, config.theme.backgroundColor, config.assets.cameraDistance, onRendererReady]);

  return null;
}

