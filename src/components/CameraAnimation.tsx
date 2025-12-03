import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera } from 'three';
import type { AppConfig } from '../types/types';

interface CameraAnimationProps {
  camera: PerspectiveCamera;
  controls: OrbitControls;
  config: AppConfig;
}

export function createCameraAnimation({ camera, controls, config }: CameraAnimationProps) {
  let isAnimating = false;
  let initialCameraPosition: THREE.Vector3 | null = null;
  let initialControlsTarget: THREE.Vector3 | null = null;

  const saveInitialPosition = () => {
    initialCameraPosition = camera.position.clone();
    initialControlsTarget = controls.target.clone();
  };

  const resetCamera = () => {
    if (initialCameraPosition && initialControlsTarget) {
      animateCameraToPosition(
        initialCameraPosition,
        initialControlsTarget
      );
    } else {
      // Fallback to default position
      const defaultPosition = new THREE.Vector3(0, 0, config.assets.cameraDistance);
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      animateCameraToPosition(defaultPosition, defaultTarget);
    }
  };

  const animateCameraToPosition = (
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    onComplete?: () => void
  ) => {
    if (isAnimating) return;
    isAnimating = true;

    const wasAutoRotating = controls.autoRotate;
    const wasControlsEnabled = controls.enabled;
    controls.autoRotate = false;
    controls.enabled = false;

    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();

    const duration = 1500;
    const startTime = performance.now();

    const animateCamera = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPosition, targetPosition, ease);
      controls.target.lerpVectors(startTarget, targetLookAt, ease);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        console.log('Animation complete, progress:', progress);
        camera.position.copy(targetPosition);
        controls.target.copy(targetLookAt);
        controls.update();

        controls.enabled = wasControlsEnabled;
        controls.autoRotate = wasAutoRotating;
        isAnimating = false;

        console.log('Calling onComplete callback, exists:', !!onComplete);
        if (onComplete) {
          onComplete();
        }
      }
    };

    console.log('Starting camera animation');
    animateCamera();
  };

  const animateCameraToHotspot = (hotspotObject: THREE.Object3D, onComplete?: () => void) => {
    console.log('animateCameraToHotspot called, isAnimating:', isAnimating);
    if (isAnimating) return;

    const hotspotPosition = new THREE.Vector3();
    hotspotObject.getWorldPosition(hotspotPosition);
    console.log('Animating to hotspot position:', hotspotPosition);

    const baseDistance = config.assets.cameraDistance;
    const distanceToHotspot = hotspotPosition.length();

    const dynamicDistance = Math.max(
      baseDistance * 0.7,
      Math.min(baseDistance * 1.5, distanceToHotspot * 1.8)
    );

    let directionToHotspot = new THREE.Vector3();
    if (distanceToHotspot > 0.01) {
      directionToHotspot = hotspotPosition.clone().normalize();
    } else {
      directionToHotspot.set(0, 0, 1);
    }

    const heightOffset = dynamicDistance * 0.5;
    const horizontalOffset = dynamicDistance * 0.7;

    const targetPosition = new THREE.Vector3(
      hotspotPosition.x + directionToHotspot.x * horizontalOffset,
      hotspotPosition.y + heightOffset,
      hotspotPosition.z + directionToHotspot.z * horizontalOffset
    );

    const targetLookAt = hotspotPosition.clone();

    animateCameraToPosition(targetPosition, targetLookAt, () => {
      console.log('Camera animation complete, calling onComplete');
      if (onComplete) {
        onComplete();
      }
    });
  };

  return {
    animateCameraToHotspot,
    resetCamera,
    saveInitialPosition,
    isAnimating: () => isAnimating,
  };
}

