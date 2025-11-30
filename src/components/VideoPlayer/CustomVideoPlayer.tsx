import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface CustomVideoPlayerProps {
  videoId: string;
  title?: string;
  onProgress?: (watchedSeconds: number, percentage: number) => void;
  onComplete?: () => void;
  isLive?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function CustomVideoPlayer({
  videoId,
  title,
  onProgress,
  onComplete,
  isLive = false,
  autoplay = false,
  className = '',
}: CustomVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const openInYouTube = () => {
    const url = isLive 
      ? `https://www.youtube.com/live/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;
    window.open(url, '_blank');
  };

  // YouTube IFrame API
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Track progress for non-live videos
  useEffect(() => {
    if (!isLive && onProgress && iframeRef.current) {
      progressIntervalRef.current = setInterval(() => {
        // Send message to iframe to get current time
        iframeRef.current?.contentWindow?.postMessage(
          '{"event":"command","func":"getCurrentTime","args":""}',
          '*'
        );
      }, 5000); // Track every 5 seconds

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isLive, onProgress]);

  // Listen for messages from YouTube player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;

      try {
        const data = JSON.parse(event.data);
        
        // Handle player state changes
        if (data.event === 'onStateChange') {
          // 0 = ended
          if (data.info === 0 && onComplete) {
            onComplete();
          }
        }

        // Handle current time updates
        if (data.event === 'infoDelivery' && data.info?.currentTime && data.info?.duration) {
          const currentTime = data.info.currentTime;
          const duration = data.info.duration;
          const percentage = (currentTime / duration) * 100;

          if (onProgress) {
            onProgress(Math.floor(currentTime), percentage);
          }

          // Auto-complete at 80%
          if (percentage >= 80 && onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onComplete]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (!iframeRef.current) return;

    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(
      `{"event":"command","func":"${command}","args":""}`,
      '*'
    );
    setIsMuted(!isMuted);
  };

  // Build YouTube URL with appropriate parameters
  const getYouTubeUrl = () => {
    // Try multiple embed methods for live streams
    if (isLive) {
      // Method 1: Use /live/ endpoint with minimal restrictions
      const baseUrl = `https://www.youtube.com/embed/live_stream`;
      const params = new URLSearchParams({
        channel: videoId, // Try as channel first
        autoplay: autoplay ? '1' : '0',
        mute: '0',
        controls: '1',
        fs: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: window.location.origin,
        widget_referrer: window.location.origin,
      });
      
      // If that doesn't work, fall back to direct video ID
      const fallbackUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      const fallbackParams = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        mute: '0',
        controls: '1',
        fs: '1',
        playsinline: '1',
        rel: '0',
        modestbranding: '1',
        enablejsapi: '1',
        origin: window.location.origin,
        widget_referrer: window.location.origin,
      });
      
      // Use the direct video ID method for live streams
      return `${fallbackUrl}?${fallbackParams.toString()}`;
    }
    
    // For regular videos
    const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      controls: '1',
      fs: '1',
      showinfo: '0',
      iv_load_policy: '3',
      disablekb: '0',
      autoplay: autoplay ? '1' : '0',
      enablejsapi: '1',
      origin: window.location.origin,
      widget_referrer: window.location.origin,
    });

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
    >
      {/* Video Title Overlay (top) */}
      {title && !isFullscreen && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
          <h3 className="text-white font-medium text-sm md:text-base line-clamp-1">
            {title}
          </h3>
        </div>
      )}

      {/* YouTube IFrame */}
      <div className="relative aspect-video">
        <iframe
          ref={iframeRef}
          src={getYouTubeUrl()}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
          referrerPolicy="origin"
          title={title || 'Video Player'}
        />
      </div>

      {/* Custom Controls Overlay (bottom) */}
      {!isLive && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Volume Control */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>
        </div>
      )}

      {/* Live Controls (minimal) */}
      {isLive && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
