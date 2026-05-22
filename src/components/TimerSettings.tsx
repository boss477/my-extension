import React from 'react';

interface TimerSettingsProps {
  onTimeSet: (seconds: number) => void;
}

export default function TimerSettings({ onTimeSet }: TimerSettingsProps) {
  const presetTimes = [1, 5, 10, 15, 25, 30];

  return (
    <div className="w-full bg-[#16161E]/85 backdrop-blur-md border border-white/5 rounded-2xl p-3 shadow-inner z-10 relative">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Presets</span>
      <div className="grid grid-cols-3 gap-1.5">
        {presetTimes.map((mins) => (
          <button
            key={mins}
            onClick={() => onTimeSet(mins * 60)}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 transition-all duration-200 active:scale-95 text-center"
          >
            {mins}m
          </button>
        ))}
      </div>
    </div>
  );
}