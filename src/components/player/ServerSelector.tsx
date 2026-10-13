import React from 'react';
import { Server, ShieldCheck, AlertCircle } from 'lucide-react';
import { PlaybackSource } from '../../types';

interface ServerSelectorProps {
  sources: PlaybackSource[];
  currentSourceId: string;
  onSelectSource: (sourceId: string) => void;
  hasError?: boolean;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  sources,
  currentSourceId,
  onSelectSource,
  hasError = false,
}) => {
  if (!sources || sources.length <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#181818] border border-[#333333] rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-[#800000]" />
        <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
          Streaming Server
        </span>
        {hasError && (
          <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Issue detected – Switch server
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {sources.map((src) => {
          const isSelected = src.id === currentSourceId;
          return (
            <button
              key={src.id}
              type="button"
              onClick={() => onSelectSource(src.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isSelected
                  ? 'bg-[#800000] text-white shadow-sm font-semibold'
                  : 'bg-[#222222] hover:bg-[#333333] text-[#B3B3B3] hover:text-white border border-[#333333]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{src.name}</span>
              <span className="opacity-70 text-[10px]">({src.quality})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
