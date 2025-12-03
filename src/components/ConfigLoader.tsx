import { useEffect, useState } from 'react';
import App from '../App';
import type { AppConfig } from '../types/types';

export default function ConfigLoader() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const res = await fetch("./app-config/appConfig.json");
        if (!res.ok) {
          throw new Error(`Failed to load app config: ${res.status} ${res.statusText}`);
        }
        const appConfig = await res.json() as AppConfig;
        setConfig(appConfig);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error loading config'));
      }
    };

    loadAppConfig();
  }, []);

  if (error) {
    throw error;
  }

  if (!config) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading configuration...</div>
      </div>
    );
  }

  return <App config={config} />;
}

