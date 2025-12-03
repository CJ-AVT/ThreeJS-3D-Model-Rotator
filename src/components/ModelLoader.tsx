import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import type { Scene } from 'three';
import type { AppConfig } from '../types/types';
import {
  handleModelLoadError,
  validateModelUrl,
  validateModelType,
} from './ErrorHandler';

interface ModelLoaderProps {
  scene: Scene;
  config: AppConfig;
  onModelLoaded: (model: THREE.Object3D) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export default function ModelLoader({
  scene,
  config,
  onModelLoaded,
  onLoadingChange,
}: ModelLoaderProps) {
  useEffect(() => {
    onLoadingChange(true);

    // Validate model URL
    if (!validateModelUrl(config.assets.modelUrl)) {
      onLoadingChange(false);
      return;
    }

    // Validate model type
    if (!validateModelType(config.assets.modelType)) {
      onLoadingChange(false);
      return;
    }

    const onLoad = (loadedModel: THREE.Object3D) => {
      loadedModel.scale.set(
        config.assets.modelScale,
        config.assets.modelScale,
        config.assets.modelScale
      );

      // Center the model
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      loadedModel.position.sub(center);

      onModelLoaded(loadedModel);
      onLoadingChange(false);
    };

    const onError = (error: any) => {
      handleModelLoadError(
        error,
        config.assets.modelUrl,
        config.assets.modelType
      );
      onLoadingChange(false);
    };

    if (config.assets.modelType === 'gltf' || config.assets.modelType === 'glb') {
      const loader = new GLTFLoader();
      loader.load(config.assets.modelUrl, (gltf) => onLoad(gltf.scene), undefined, onError);
    } else if (config.assets.modelType === 'fbx') {
      const loader = new FBXLoader();
      loader.load(config.assets.modelUrl, onLoad, undefined, onError);
    }
  }, [scene, config, onModelLoaded, onLoadingChange]);

  return null;
}

