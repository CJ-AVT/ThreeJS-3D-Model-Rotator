import { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { AppConfig } from '../types/types';

interface UIOverlayProps {
  config: AppConfig;
  onResetCamera: () => void;
  onFullscreenToggle?: () => void;
}

export default function UIOverlay({
  config,
  onResetCamera,
  onFullscreenToggle,
}: UIOverlayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio if music track is provided
    if (config.assets.musicTrack) {
      audioRef.current = new Audio(config.assets.musicTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [config.assets.musicTrack]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        if (onFullscreenToggle) onFullscreenToggle();
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        if (onFullscreenToggle) onFullscreenToggle();
      });
    }
  };

  const handleMusicToggle = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing music:', error);
      });
      setIsMusicPlaying(true);
    }
  };

  // Only show UI controls if enabled in config
  if (!config.settings.showUIControls) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* Fullscreen Toggle */}
      <button
        onClick={handleFullscreen}
        className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-colors backdrop-blur-sm"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-colors backdrop-blur-sm"
        title="Reset Camera Position"
      >
        <RotateCcw size={20} />
      </button>

      {/* Music Toggle */}
      {config.assets.musicTrack && (
        <button
          onClick={handleMusicToggle}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-colors backdrop-blur-sm"
          title={isMusicPlaying ? 'Stop Music' : 'Play Music'}
        >
          {isMusicPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>
  );
}

