import { useEffect } from 'react';

interface ErrorHandlerProps {
  error: Error | null;
  onError: (error: Error) => void;
}

export default function ErrorHandler({ error, onError }: ErrorHandlerProps) {
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return null;
}

export function handleModelLoadError(
  error: any,
  modelUrl: string,
  modelType: string
) {
  console.error('Error loading model:', error);
  console.error('Model URL:', modelUrl);
  console.error('Model Type:', modelType);

  if (
    modelUrl.includes('path/to') ||
    modelUrl.includes('your/model') ||
    (!modelUrl.startsWith('http') &&
      !modelUrl.startsWith('/') &&
      !modelUrl.startsWith('./'))
  ) {
    console.error(
      '⚠️ Model URL appears to be a placeholder. Please update appConfig.json with a valid model path.'
    );
  }
}

export function validateModelUrl(modelUrl: string): boolean {
  if (
    !modelUrl ||
    modelUrl === 'path/to/your/model.glb' ||
    modelUrl.includes('path/to/your')
  ) {
    console.error(
      '❌ Invalid model URL in config. Please set a valid modelUrl in appConfig.json'
    );
    return false;
  }
  return true;
}

export function validateModelType(modelType: string): boolean {
  const supportedTypes = ['gltf', 'glb', 'fbx'];
  if (!supportedTypes.includes(modelType)) {
    console.error(
      `❌ Unsupported model type: ${modelType}. Supported types: ${supportedTypes.join(', ')}`
    );
    return false;
  }
  return true;
}

