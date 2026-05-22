import React from 'react';
import { Settings, Volume2 } from 'lucide-react';

interface TimerDisplayProps {
  time: number;
  initialTime: number;
  showSettings: boolean;
  showSoundSettings: boolean;
  onSettingsToggle: () => void;
  onSoundSettingsToggle: () => void;
}

export default function TimerDisplay({
  time,
  initialTime,
  showSettings,
  showSoundSettings,
  onSettingsToggle,
  onSoundSettingsToggle
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.56
  const progress = initialTime > 0 ? time / initialTime : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between px-1 z-10">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Timer</span>
        <div className="flex gap-2">
          <button
            onClick={onSoundSettingsToggle}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              showSoundSettings
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Sound Settings"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSettingsToggle}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              showSettings
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Presets"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Circular Progress Display */}
      <div className="relative w-36 h-36 flex items-center justify-center select-none my-1 z-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 148 148">
          {/* Background circle track */}
          <circle
            cx="74"
            cy="74"
            r={radius}
            className="stroke-gray-800/40 fill-none"
            strokeWidth="7"
          />
          {/* Main glowing progress circle */}
          <circle
            cx="74"
            cy="74"
            r={radius}
            className="stroke-indigo-500 fill-none transition-all duration-1000 ease-linear"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0px 0px 4px rgba(99, 102, 241, 0.5))',
            }}
          />
        </svg>

        {/* Digital Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold text-white tracking-tight select-all cursor-default"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 12px rgba(255, 255, 255, 0.15)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(time)}
          </span>
          <span className="text-[9px] text-gray-500 font-semibold tracking-widest uppercase mt-0.5">
            {time === 0 ? 'Done' : 'Remaining'}
          </span>
        </div>
      </div>
    </div>
  );
}