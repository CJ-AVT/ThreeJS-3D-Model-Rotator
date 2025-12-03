import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { X } from 'lucide-react';
import type { AppProps } from './types/types';
import Renderer from './components/Renderer';
import Controls from './components/Controls';
import ModelLoader from './components/ModelLoader';
import HotspotManager from './components/HotspotManager';
import UIOverlay from './components/UIOverlay';
import { createCameraAnimation } from './components/CameraAnimation';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera, WebGLRenderer, Scene } from 'three';

export default function App({ config }: AppProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const hotspotsRef = useRef<(THREE.Mesh | THREE.Sprite)[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rendererReady, setRendererReady] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);
  const [hotspotsReady, setHotspotsReady] = useState(false);

  // Camera animation
  const cameraAnimation = useRef<ReturnType<typeof createCameraAnimation> | null>(null);

  // Initialize camera animation when camera and controls are ready
  useEffect(() => {
    if (cameraRef.current && controlsRef.current && config && !cameraAnimation.current && controlsReady) {
      cameraAnimation.current = createCameraAnimation({
        camera: cameraRef.current,
        controls: controlsRef.current,
        config,
      });
      // Save initial position
      cameraAnimation.current.saveInitialPosition();
    }
  }, [controlsReady, config]);

  // Handle renderer ready - use useCallback to prevent recreation
  const handleRendererReady = useCallback((
    renderer: WebGLRenderer,
    scene: Scene,
    camera: PerspectiveCamera
  ) => {
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    setRendererReady(true);
  }, []);

  // Handle controls ready
  const handleControlsReady = useCallback((controls: OrbitControls) => {
    controlsRef.current = controls;
    setControlsReady(true);
  }, []);

  // Handle model loaded
  const handleModelLoaded = useCallback((model: THREE.Object3D) => {
    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
    }
    if (sceneRef.current) {
      sceneRef.current.add(model);
      modelRef.current = model;
    }
  }, []);

  // Handle hotspots ready
  const handleHotspotsReady = useCallback((hotspots: (THREE.Mesh | THREE.Sprite)[]) => {
    hotspotsRef.current = hotspots;
    setHotspotsReady(true);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Only update controls if we're not animating the camera
      if (controlsRef.current && cameraAnimation.current) {
        if (!cameraAnimation.current.isAnimating()) {
          controlsRef.current.update();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rendererReady, controlsReady]);

  // Handle mouse clicks for hotspots
  useEffect(() => {
    if (!mountRef.current || !cameraRef.current || !hotspotsReady || !controlsReady || !rendererRef.current) return;

    // Get the canvas element from the renderer
    const canvas = rendererRef.current.domElement;
    let mouseDownTime = 0;
    let mouseDownPos = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      mouseDownTime = Date.now();
      mouseDownPos.x = event.clientX;
      mouseDownPos.y = event.clientY;
    };

    const handleClick = (event: MouseEvent) => {
      // Only treat as click if mouse didn't move much and time is short (not a drag)
      const timeDiff = Date.now() - mouseDownTime;
      const moveDiff = Math.abs(event.clientX - mouseDownPos.x) + Math.abs(event.clientY - mouseDownPos.y);
      
      // If it was a drag (moved more than 5px or took more than 300ms), let OrbitControls handle it
      if (moveDiff > 5 || timeDiff > 300) {
        return;
      }

      if (!mountRef.current || !cameraRef.current || !cameraAnimation.current) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(hotspotsRef.current);

      // Only handle if we hit a hotspot
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh | THREE.Sprite;
        const hotspotIndex = hotspotsRef.current.findIndex(
          (h) => h.uuid === intersectedObject.uuid
        );
        if (hotspotIndex !== -1) {
          const clickedHotspot = intersects[0].object;
          const hotspotData = config.settings.hotspots[hotspotIndex];

          // Animate camera first, then show popup when animation completes
          cameraAnimation.current.animateCameraToHotspot(clickedHotspot, () => {
            setSelectedHotspot(hotspotData);
          });
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleClick);
    };
  }, [hotspotsReady, controlsReady, rendererReady, config]);

  // Handle reset camera
  const handleResetCamera = () => {
    if (cameraAnimation.current) {
      cameraAnimation.current.resetCamera();
      setSelectedHotspot(null);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Renderer Component */}
      <Renderer
        mountRef={mountRef}
        config={config}
        onRendererReady={handleRendererReady}
      />

      {/* Controls Component */}
      {rendererReady && cameraRef.current && rendererRef.current && (
        <Controls
          camera={cameraRef.current}
          renderer={rendererRef.current}
          config={config}
          onControlsReady={handleControlsReady}
        />
      )}

      {/* Model Loader Component */}
      {rendererReady && sceneRef.current && (
        <ModelLoader
          scene={sceneRef.current}
          config={config}
          onModelLoaded={handleModelLoaded}
          onLoadingChange={setIsLoading}
        />
      )}

      {/* Hotspot Manager Component */}
      {rendererReady && sceneRef.current && modelRef.current && (
        <HotspotManager
          scene={sceneRef.current}
          config={config}
          onHotspotsReady={handleHotspotsReady}
        />
      )}

      {/* UI Overlay Component */}
      <UIOverlay config={config} onResetCamera={handleResetCamera} />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">Loading model...</div>
        </div>
      )}

      {/* Title Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <h1 className="text-white text-3xl font-bold">{config.context.title}</h1>
        <p className="text-gray-300 text-sm mt-1">{config.context.description}</p>
      </div>

      {/* Hotspot Popup */}
      {selectedHotspot && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 pointer-events-auto"
            style={{
              backgroundColor: config.theme.popupBackgroundColor,
              color: config.theme.popupTextColor,
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedHotspot.content.title}</h3>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700">{selectedHotspot.content.description}</p>
          </div>
        </div>
      )}

      {/* Controls Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <div className="text-white text-sm text-center">
          <p>Left click + drag to rotate • Right click + drag to pan • Scroll to zoom</p>
          <p className="text-gray-400 mt-1">Click on hotspots to view details</p>
        </div>
      </div>
    </div>
  );
}
