
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
      const url = new URL(activeSource.url);

      // Resume parameters are provider-specific. Only add this parameter
      // if the selected provider supports it.
      if (
        previousProgress &&
        previousProgress.progressSeconds > 10 &&
        !url.searchParams.has('t')
      ) {
        // Preserve the original URL by default. Do not assume every
        // embedded player supports a timestamp parameter.
      }

      return url.toString();
    } catch {
      return '';
    }
  }, [activeSource, previousProgress]);

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
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
  }, [clearConnectionTimer]);

  useEffect(() => {
    if (!sources.length) {
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
          'The embedded player did not respond in time. The source may be unavailable or may not support player status messages. Try another available source.'
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
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

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
      // Accept messages only from this component's iframe.
      if (event.source !== iframeRef.current?.contentWindow) return;

      // Require the expected provider message format.
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

      if (!frameWindow) {
        setHasError(true);
        setErrorMessage('The embedded player has not loaded yet.');
        return;
      }

      try {
        // The provider must support these commands for them to work.
        frameWindow.postMessage(command, '*');
      } catch (error) {
        console.error('Unable to send command to embedded player:', error);
      }
    },
    []
  );

  const handleTogglePlay = useCallback(() => {
    postToPlayer({ action: 'togglePlay' });
    // Playback state is updated only when the player reports it.
  }, [postToPlayer]);

  const handleSeekDelta = useCallback(
    (deltaSeconds: number) => {
      const target = Math.max(0, currentTime + deltaSeconds);

      postToPlayer({
        action: 'seek',
        time: target,
      });
    },
    [currentTime, postToPlayer]
  );

  const handleToggleMute = useCallback(() => {
    postToPlayer({
      action: isMuted ? 'unmute' : 'mute',
    });

    // This reflects the requested state, not confirmed player state.
    setIsMuted((previous) => !previous);
  }, [isMuted, postToPlayer]);

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
    // An iframe load does not prove that the video stream works.
    // Keep waiting for a supported player event.
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#181818] z-30">
            <AlertTriangle className="w-12 h-12 text-[#800000] mb-3" />

            <h3 className="text-lg font-bold text-white mb-2">
              Playback Unavailable
            </h3>

            <p className="text-sm text-[#B3B3B3] max-w-md mb-4">
              {errorMessage ||
                'The selected playback source is unavailable.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg border border-[#333333] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Current Source
              </button>

              {sources.length > 1 && (
                <button
                  type="button"
                  onClick={handleSwitchToNextServer}
                  className="px-4 py-2 bg-[#800000] hover:bg-[#9B111E] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Try Another Source
                </button>
              )}
            </div>
          </div>
        ) : !embedUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#181818]">
            <AlertTriangle className="w-10 h-10 text-[#800000] mb-3" />
            <p className="text-sm text-[#B3B3B3]">
              No valid playback URL is available.
            </p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#101010] pointer-events-none">
                <RefreshCw className="w-8 h-8 text-[#800000] animate-spin mb-3" />
                <p className="text-sm text-[#B3B3B3]">
                  Connecting to player...
                </p>
              </div>
            )}

           <div className="absolute inset-0">
  <iframe
    key={`${currentSourceId}-${reloadKey}`}
    ref={iframeRef}
    src={embedUrl}
    title={`${media.title}${episode ? ` - ${episode.title}` : ''} Player`}
    className="absolute inset-0 w-full h-full border-0"
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
    allowFullScreen
    referrerPolicy="origin"
    onLoad={handleIframeLoad}
    onError={handleIframeError}
  />

  {/* Blocks clicks on the embedded player */}
  <div
    className="absolute inset-0 z-10"
    aria-hidden="true"
  />
</div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 mt-3 bg-[#181818] border border-[#333333] rounded-lg">
        <div className="flex items-center gap-3 text-xs text-[#B3B3B3] w-full sm:w-auto">
          {playerConnected && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-white">
              <Clock className="w-3.5 h-3.5 text-[#800000]" />

              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {percentage > 0 && (
                <span className="text-[#808080]">
                  ({Math.round(percentage)}%)
                </span>
              )}
            </div>
          )}

          {previousProgress &&
            previousProgress.progressSeconds > 10 &&
            !playerConnected && (
              <div className="flex items-center gap-1.5 text-xs text-white">
                <span className="w-2 h-2 bg-[#800000] rounded-lg" />
                <span>
                  Saved progress: {formatTime(previousProgress.progressSeconds)}
                </span>
              </div>
            )}

          {!playerConnected && !isLoading && !hasError && (
            <span className="text-[#808080]">
              Waiting for player status...
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSeekDelta(-10)}
            disabled={!playerConnected}
            className="p-1.5 bg-[#222222] hover:bg-[#333333] disabled:opacity-40 text-white rounded-lg border border-[#333333] transition-colors"
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!playerConnected}
            className="px-3 py-1.5 bg-[#800000] hover:bg-[#9B111E] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            aria-label={isPlaying ? 'Pause playback' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSeekDelta(10)}
            disabled={!playerConnected}
            className="p-1.5 bg-[#222222] hover:bg-[#333333] disabled:opacity-40 text-white rounded-lg border border-[#333333] transition-colors"
            title="Skip 10 seconds"
            aria-label="Skip 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!playerConnected}
            className="p-1.5 bg-[#222222] hover:bg-[#333333] disabled:opacity-40 text-white rounded-lg border border-[#333333] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-1.5 bg-[#222222] hover:bg-[#333333] text-white rounded-lg border border-[#333333] transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>

          {activeSource?.url && (
            <a
              href={activeSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#222222] hover:bg-[#333333] text-[#B3B3B3] hover:text-white rounded-lg border border-[#333333] transition-colors"
              title="Open source in a new tab"
              aria-label="Open source in a new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
