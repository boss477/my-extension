import React from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggle: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function TimerControls({ isRunning, isPaused, onToggle, onPause, onReset }: TimerControlsProps) {
  return (
    <div className="flex gap-2.5 w-full items-center">
      {isRunning || isPaused ? (
        <>
          <button
            onClick={isPaused ? onToggle : onPause}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 text-[11px] font-semibold tracking-wider uppercase border ${
              isPaused
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-95'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] active:scale-95'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl flex items-center justify-center transition-all duration-300 border bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-400 hover:text-white active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={onToggle}
          className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 text-[11px] font-bold tracking-widest uppercase bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.5)] active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Start Focus
        </button>
      )}
    </div>
  );
}