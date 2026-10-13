
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Clock,
  Captions,
} from 'lucide-react';

import { MediaItem, Episode, PlaybackSource } from '../../types';
import { ServerSelector } from './ServerSelector';
import { useHistory } from '../../hooks/useHistory';

interface VideoPlayerProps {
  media: MediaItem;
  episode?: Episode;
  sources: PlaybackSource[];
}

const PLAYER_CONNECT_TIMEOUT = 15000;

const PLAYER_EVENTS = new Set([
  'play',
  'pause',
  'timeupdate',
  'seeked',
  'ended',
  'playerstatus',
]);

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  media,
  episode,
  sources,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const connectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { history, saveProgress } = useHistory();

  const [currentSourceId, setCurrentSourceId] = useState(
    () => sources[0]?.id || ''
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [playerConnected, setPlayerConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const historyKey = `${media.id}-${episode?.seasonNumber || 0}-${episode?.episodeNumber || 0}`;

  const previousProgress = history.find(
    (item) =>
      `${item.mediaId}-${item.seasonNumber || 0}-${item.episodeNumber || 0}` ===
      historyKey
  );

  const activeSource = useMemo(
    () =>
      sources.find((source) => source.id === currentSourceId) ||
      sources[0],
    [sources, currentSourceId]
  );

  const embedUrl = useMemo(() => {
    if (!activeSource?.url) return '';

    try {
      return new URL(activeSource.url).toString();
    } catch {
      return '';
    }
  }, [activeSource]);

  const clearConnectionTimer = useCallback(() => {
    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
  }, []);

  const resetPlayerState = useCallback(() => {
    clearConnectionTimer();
    setPlayerConnected(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPercentage(0);
    setIsMuted(false);
    setVolume(1);
    setCaptionsEnabled(false);
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
  }, [clearConnectionTimer]);

  useEffect(() => {
    if (sources.length === 0) {
      setCurrentSourceId('');
      resetPlayerState();
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('No playback sources are available for this title.');
      return;
    }

    if (!sources.some((source) => source.id === currentSourceId)) {
      setCurrentSourceId(sources[0].id);
    }
  }, [sources, currentSourceId, resetPlayerState]);

  useEffect(() => {
    resetPlayerState();

    if (!embedUrl) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('The selected playback source has an invalid URL.');
      return;
    }

    connectionTimerRef.current = setTimeout(() => {
      setIsLoading(false);

      if (!playerConnected) {
        setHasError(true);
        setErrorMessage(
          'The embedded player did not respond in time. The source may be unavailable or may not support external player controls.'
        );
      }
    }, PLAYER_CONNECT_TIMEOUT);

    return () => {
      clearConnectionTimer();
    };
  }, [
    embedUrl,
    reloadKey,
    resetPlayerState,
    clearConnectionTimer,
  ]);

  const formatTime = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(
        remainingSeconds
      ).padStart(2, '0')}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }, []);

  const persistProgress = useCallback(() => {
    if (currentTime <= 5 || duration <= 0) return;

    saveProgress({
      media,
      progressSeconds: currentTime,
      durationSeconds: duration,
      seasonNumber: episode?.seasonNumber,
      episodeNumber: episode?.episodeNumber,
      episodeTitle: episode?.title,
    });
  }, [currentTime, duration, media, episode, saveProgress]);

  useEffect(() => {
    const interval = setInterval(persistProgress, 5000);

    return () => {
      clearInterval(interval);
      persistProgress();
    };
  }, [persistProgress]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (
        !event.data ||
        typeof event.data !== 'object' ||
        event.data.source !== 'moviesapi-player' ||
        !PLAYER_EVENTS.has(event.data.event)
      ) {
        return;
      }

      const data = event.data;

      setPlayerConnected(true);
      setIsLoading(false);
      clearConnectionTimer();

      switch (data.event) {
        case 'play':
          setIsPlaying(true);

          if (Number.isFinite(data.currentTime)) {
            setCurrentTime(data.currentTime);
          }

          if (Number.isFinite(data.duration)) {
            setDuration(data.duration);
          }
          break;

        case 'pause':
          setIsPlaying(false);

          if (Number.isFinite(data.currentTime)) {
            setCurrentTime(data.currentTime);
          }
          break;

        case 'timeupdate':
          if (Number.isFinite(data.currentTime)) {
            setCurrentTime(data.currentTime);
          }

          if (Number.isFinite(data.duration)) {
            setDuration(data.duration);
          }

          if (Number.isFinite(data.percentage)) {
            setPercentage(data.percentage);
          }
          break;

        case 'seeked':
          if (Number.isFinite(data.currentTime)) {
            setCurrentTime(data.currentTime);
          }
          break;

        case 'ended':
          setIsPlaying(false);
          setPercentage(100);
          persistProgress();
          break;

        case 'playerstatus':
          if (typeof data.paused === 'boolean') {
            setIsPlaying(!data.paused);
          }

          if (Number.isFinite(data.currentTime)) {
            setCurrentTime(data.currentTime);
          }

          if (Number.isFinite(data.duration)) {
            setDuration(data.duration);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [clearConnectionTimer, persistProgress]);

  const postToPlayer = useCallback(
    (command: Record<string, unknown>) => {
      const frameWindow = iframeRef.current?.contentWindow;

      if (!frameWindow) return;

      try {
        frameWindow.postMessage(command, '*');
      } catch (error) {
        console.error('Unable to send command to embedded player:', error);
      }
    },
    []
  );

  const handleTogglePlay = useCallback(() => {
    postToPlayer({ action: 'togglePlay' });
  }, [postToPlayer]);

  const handleSeekTo = useCallback(
    (targetTime: number) => {
      if (duration <= 0) return;

      const target = Math.max(0, Math.min(duration, targetTime));

      postToPlayer({
        action: 'seek',
        time: target,
      });
    },
    [duration, postToPlayer]
  );

  const handleSeekDelta = useCallback(
    (deltaSeconds: number) => {
      handleSeekTo(currentTime + deltaSeconds);
    },
    [currentTime, handleSeekTo]
  );

  const handleProgressChange = useCallback(
    (value: number) => {
      if (duration <= 0) return;

      const target = (value / 100) * duration;

      setPercentage(value);
      handleSeekTo(target);
    },
    [duration, handleSeekTo]
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      const nextVolume = Math.max(0, Math.min(1, value));

      setVolume(nextVolume);
      setIsMuted(nextVolume === 0);

      postToPlayer({
        action: 'setVolume',
        volume: nextVolume,
      });

      postToPlayer({
        action: nextVolume === 0 ? 'mute' : 'unmute',
      });
    },
    [postToPlayer]
  );

  const handleToggleMute = useCallback(() => {
    if (isMuted || volume === 0) {
      handleVolumeChange(volume > 0 ? volume : 1);
    } else {
      setIsMuted(true);
      postToPlayer({ action: 'mute' });
    }
  }, [isMuted, volume, handleVolumeChange, postToPlayer]);

  const handleToggleCaptions = useCallback(() => {
    const enabled = !captionsEnabled;

    setCaptionsEnabled(enabled);

    postToPlayer({
      action: 'toggleCaptions',
      enabled,
    });
  }, [captionsEnabled, postToPlayer]);

  const handleFullscreen = useCallback(async () => {
    const container = containerRef.current;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      postToPlayer({ action: 'enterFullscreen' });
    }
  }, [postToPlayer]);

  const handleSwitchToNextServer = useCallback(() => {
    if (sources.length < 2) return;

    const currentIndex = sources.findIndex(
      (source) => source.id === currentSourceId
    );

    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + 1) % sources.length;

    setCurrentSourceId(sources[nextIndex].id);
    setReloadKey((key) => key + 1);
  }, [sources, currentSourceId]);

  const handleRetry = useCallback(() => {
    resetPlayerState();
    setReloadKey((key) => key + 1);
  }, [resetPlayerState]);

  const handleIframeLoad = useCallback(() => {
    // Loading the iframe does not guarantee that the video stream works.
    setIsLoading(true);
  }, []);

  const handleIframeError = useCallback(() => {
    clearConnectionTimer();
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(
      'The embedded player could not be loaded. Try another available source.'
    );
  }, [clearConnectionTimer]);

  return (
    <div className="w-full">
      <ServerSelector
        sources={sources}
        currentSourceId={currentSourceId}
        onSelectSource={(id) => {
          if (id === currentSourceId) return;

          setCurrentSourceId(id);
          setReloadKey((key) => key + 1);
        }}
        hasError={hasError}
      />

      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black overflow-hidden border border-[#333333] rounded-lg group select-none shadow-2xl"
      >
        {hasError ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#181818] p-6 text-center">
            <AlertTriangle className="mb-3 h-12 w-12 text-[#800000]" />

            <h3 className="mb-2 text-lg font-bold text-white">
              Playback Unavailable
            </h3>

            <p className="mb-4 max-w-md text-sm text-[#B3B3B3]">
              {errorMessage ||
                'The selected playback source is unavailable.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-lg border border-[#333333] bg-[#222222] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#333333]"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Current Source
              </button>

              {sources.length > 1 && (
                <button
                  type="button"
                  onClick={handleSwitchToNextServer}
                  className="rounded-lg bg-[#800000] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9B111E]"
                >
                  Try Another Source
                </button>
              )}
            </div>
          </div>
        ) : !embedUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181818] p-6 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-[#800000]" />
            <p className="text-sm text-[#B3B3B3]">
              No valid playback URL is available.
            </p>
          </div>
        ) : (
          <>
           <iframe
  ref={iframeRef}
  src={embedUrl}
  title="MoviesAPI Player"
  className="absolute inset-0 h-full w-full border-0"
  sandbox="allow-scripts allow-same-origin allow-forms"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
  referrerPolicy="strict-origin-when-cross-origin"
/>

            {isLoading && (
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#101010]/90">
                <RefreshCw className="mb-3 h-8 w-8 animate-spin text-[#800000]" />
                <p className="text-sm text-[#B3B3B3]">
                  Connecting to player...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      

     
    </div>
  );
};

export default VideoPlayer;
