import React from 'react';

interface TimeInputProps {
  onTimeSet: (seconds: number) => void;
}

export default function TimeInput({ onTimeSet }: TimeInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const minutes = Math.max(0, Math.min(59, Number(formData.get('minutes')) || 0));
    const seconds = Math.max(0, Math.min(59, Number(formData.get('seconds')) || 0));
    
    if (minutes === 0 && seconds === 0) {
      return; // Don't set timer if both values are 0
    }
    
    onTimeSet(minutes * 60 + seconds);
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2 mt-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            name="minutes"
            min="0"
            max="59"
            placeholder="Min"
            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 focus:border-indigo-500/50 text-white placeholder-gray-500 rounded-xl text-xs text-center outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>
        <div className="relative">
          <input
            type="number"
            name="seconds"
            min="0"
            max="59"
            placeholder="Sec"
            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 focus:border-indigo-500/50 text-white placeholder-gray-500 rounded-xl text-xs text-center outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-1.5 px-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95"
      >
        Set Custom Duration
      </button>
    </form>
  );
}