import React from 'react';

interface AudioVisualizerProps {
  level: number; // 0 - 100
  isActive: boolean;
  colorClass?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  level,
  isActive,
  colorClass = 'bg-blue-500',
  barCount = 18
}) => {
  return (
    <div className="flex items-center justify-center gap-[3px] h-9 px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800/80 backdrop-blur-sm">
      {Array.from({ length: barCount }).map((_, i) => {
        // Calculate organic wave heights based on level and index
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
        const factor = Math.cos(centerDistance * (Math.PI / 2));
        
        let barHeight = 4; // minimum idle height
        if (isActive && level > 2) {
          // Add rhythmic variation to bars
          const variance = Math.sin((i + Date.now() / 150) * 0.8) * 0.35 + 0.65;
          barHeight = Math.max(4, Math.min(32, Math.round((level / 100) * 32 * factor * variance)));
        }

        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-75 ${
              isActive && level > 2 ? colorClass : 'bg-slate-700/60'
            }`}
            style={{
              height: `${barHeight}px`,
              opacity: isActive ? (level > 2 ? 0.95 : 0.4) : 0.25
            }}
          />
        );
      })}
    </div>
  );
};
