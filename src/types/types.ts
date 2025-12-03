export interface AppConfig {
  context: {
    title: string;
    description: string;
  };
  theme: {
    backgroundColor: string;
    hotspotColor: string;
    hotspotHoverColor?: string;
    popupBackgroundColor: string;
    popupTextColor?: string;
  };
  assets: {
    modelUrl: string;
    modelType: string;
    modelScale: number;
    cameraDistance: number;
  };
  settings: {
    autoRotate: boolean;
    rotateSpeed: number;
    enableControls?: boolean;
    hotspots: Array<{
      id?: string;
      position: { x: number; y: number; z: number };
      shape: string;
      size: number;
      color: string;
      pulsate: boolean;
      content: {
        title: string;
        description: string;
      };
    }>;
  };
}

export interface AppProps {
  config: AppConfig;
}

