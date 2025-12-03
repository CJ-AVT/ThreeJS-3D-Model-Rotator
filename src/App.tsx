import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { X } from 'lucide-react';
import type { AppProps } from './types/types';

export default function App({ config }: AppProps) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const hotspotsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = config.settings.autoRotate;
    controls.autoRotateSpeed = config.settings.rotateSpeed;
    controls.enabled = config.settings.enableControls ?? true;
    controlsRef.current = controls;

    // Function to animate camera to hotspot
    const animateCameraToHotspot = (hotspotObject: THREE.Object3D, onComplete?: () => void) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Temporarily disable auto-rotate and user controls
      const wasAutoRotating = controls.autoRotate;
      const wasControlsEnabled = controls.enabled;
      controls.autoRotate = false;
      controls.enabled = false; // Disable user controls during animation

      // Get hotspot world position
      const hotspotPosition = new THREE.Vector3();
      hotspotObject.getWorldPosition(hotspotPosition);

      // Calculate camera position dynamically based on hotspot position
      const baseDistance = config.assets.cameraDistance;
      
      // Calculate distance from origin to hotspot
      const distanceToHotspot = hotspotPosition.length();
      
      // Calculate optimal viewing distance based on hotspot's distance from center
      // Hotspots further from center need more distance, closer ones need less
      const dynamicDistance = Math.max(
        baseDistance * 0.7,
        Math.min(baseDistance * 1.5, distanceToHotspot * 1.8)
      );
      
      // Calculate direction vector from origin to hotspot (for positioning)
      let directionToHotspot = new THREE.Vector3();
      if (distanceToHotspot > 0.01) {
        directionToHotspot = hotspotPosition.clone().normalize();
      } else {
        // If hotspot is at origin, use default direction
        directionToHotspot.set(0, 0, 1);
      }
      
      // Calculate camera position: positioned above and offset from hotspot
      // The offset is based on the hotspot's position relative to the model
      const heightOffset = dynamicDistance * 0.5; // Vertical offset (above)
      const horizontalOffset = dynamicDistance * 0.7; // Horizontal offset
      
      // Position camera above the hotspot, offset along the direction from origin
      // This ensures good viewing angle regardless of hotspot position
      const targetPosition = new THREE.Vector3(
        hotspotPosition.x + directionToHotspot.x * horizontalOffset,
        hotspotPosition.y + heightOffset,
        hotspotPosition.z + directionToHotspot.z * horizontalOffset
      );

      // Store initial camera position and rotation
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const targetLookAt = hotspotPosition.clone();

      // Animation parameters
      const duration = 1500; // 1.5 seconds for smoother animation
      const startTime = performance.now();

      const animateCamera = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function (ease-in-out-cubic)
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Interpolate camera position smoothly
        camera.position.lerpVectors(startPosition, targetPosition, ease);
        
        // Interpolate look-at target smoothly
        controls.target.lerpVectors(startTarget, targetLookAt, ease);
        
        // Update controls to apply the changes
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          // Ensure we're exactly at the target
          camera.position.copy(targetPosition);
          controls.target.copy(targetLookAt);
          controls.update();
          
          // Restore controls and auto-rotate
          controls.enabled = wasControlsEnabled;
          controls.autoRotate = wasAutoRotating;
          isAnimatingRef.current = false;
          
          // Call completion callback
          if (onComplete) {
            onComplete();
          }
        }
      };

      animateCamera();
    };

    // Load model
    loadModel(scene);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Only update controls if we're not animating the camera
      if (!isAnimatingRef.current) {
        controls.update();
      }
      
      // Animate pulsating hotspots
      hotspotsRef.current.forEach((hotspot, index) => {
        if (config.settings.hotspots[index]?.pulsate) {
          const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
          hotspot.scale.set(scale, scale, scale);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle mouse clicks
    const handleClick = (event) => {
      if (!mountRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(hotspotsRef.current);

      if (intersects.length > 0) {
        const hotspotIndex = hotspotsRef.current.indexOf(intersects[0].object);
        if (hotspotIndex !== -1) {
          const clickedHotspot = intersects[0].object;
          const hotspotData = config.settings.hotspots[hotspotIndex];
          
          // Animate camera first, then show popup when animation completes
          animateCameraToHotspot(clickedHotspot, () => {
            setSelectedHotspot(hotspotData);
          });
        }
      }
    };
    mountRef.current.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [config]);

  const loadModel = (scene) => {
    setIsLoading(true);
    
    const onLoad = (loadedModel) => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }

      loadedModel.scale.set(
        config.assets.modelScale,
        config.assets.modelScale,
        config.assets.modelScale
      );

      scene.add(loadedModel);
      modelRef.current = loadedModel;

      // Center the model
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      loadedModel.position.sub(center);

      // Add hotspots
      addHotspots(scene);
      setIsLoading(false);
    };

    const onError = (error) => {
      console.error('Error loading model:', error);
      console.error('Model URL:', config.assets.modelUrl);
      console.error('Model Type:', config.assets.modelType);
      
      // Check if the URL looks like a placeholder
      if (config.assets.modelUrl.includes('path/to') || 
          config.assets.modelUrl.includes('your/model') ||
          !config.assets.modelUrl.startsWith('http') && !config.assets.modelUrl.startsWith('/') && !config.assets.modelUrl.startsWith('./')) {
        console.error('⚠️ Model URL appears to be a placeholder. Please update appConfig.json with a valid model path.');
      }
      
      setIsLoading(false);
    };

    // Validate model URL before attempting to load
    if (!config.assets.modelUrl || 
        config.assets.modelUrl === 'path/to/your/model.glb' ||
        config.assets.modelUrl.includes('path/to/your')) {
      console.error('❌ Invalid model URL in config. Please set a valid modelUrl in appConfig.json');
      setIsLoading(false);
      return;
    }

    if (config.assets.modelType === 'gltf' || config.assets.modelType === 'glb') {
      const loader = new GLTFLoader();
      loader.load(
        config.assets.modelUrl,
        (gltf) => onLoad(gltf.scene),
        undefined,
        onError
      );
    } else if (config.assets.modelType === 'fbx') {
      const loader = new FBXLoader();
      loader.load(config.assets.modelUrl, onLoad, undefined, onError);
    } else {
      console.error(`❌ Unsupported model type: ${config.assets.modelType}. Supported types: gltf, glb, fbx`);
      setIsLoading(false);
    }
  };

  const addHotspots = (scene) => {
    // Remove existing hotspots
    hotspotsRef.current.forEach(hotspot => scene.remove(hotspot));
    hotspotsRef.current = [];

    config.settings.hotspots.forEach((hotspotConfig) => {
      let geometry;
      
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
        opacity: 0.8
      });

      const hotspot = new THREE.Mesh(geometry, material);
      hotspot.position.set(
        hotspotConfig.position.x,
        hotspotConfig.position.y,
        hotspotConfig.position.z
      );

      scene.add(hotspot);
      hotspotsRef.current.push(hotspot);
    });
  };

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

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
              color: config.theme.popupTextColor 
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