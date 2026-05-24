import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import AudioUpload from './AudioUpload';

interface SoundSettingsProps {
  settings: {
    enabled: boolean;
    volume: number;
    tickInterval: number;
    soundType: string;
    endSoundType: string;
    customTickSound?: File;
    customEndSound?: File;
  };
  onChange: (settings: any) => void;
}

export default function SoundSettings({ settings, onChange }: SoundSettingsProps) {
  const handleTickAudioSelect = (file: File) => {
    onChange({ ...settings, soundType: 'custom', customTickSound: file });
  };

  const handleEndAudioSelect = (file: File) => {
    onChange({ ...settings, endSoundType: 'custom', customEndSound: file });
  };

  const removeTickAudio = () => {
    const { customTickSound, ...rest } = settings;
    onChange({ ...rest, soundType: 'paper' });
  };

  const removeEndAudio = () => {
    const { customEndSound, ...rest } = settings;
    onChange({ ...rest, endSoundType: 'trumpet' });
  };

  return (
    <div className="w-full bg-[#16161E]/85 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-inner space-y-3 z-10 relative">
      {/* Sound Header with Enable Toggle */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sound FX</span>
        <button
          type="button"
          onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
          className={`p-1.5 rounded-lg border transition-all duration-200 ${
            settings.enabled
              ? 'bg-indigo-500/20 border-indigo-500/35 text-indigo-400'
              : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-400'
          }`}
        >
          {settings.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-3 animate-fade-in">
          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
              <span>Volume</span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => onChange({ ...settings, volume: parseFloat(e.target.value) })}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Tick Interval Selection */}
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-gray-400 block">Tick Interval</span>
            <select
              value={settings.tickInterval}
              onChange={(e) => onChange({ ...settings, tickInterval: parseInt(e.target.value) })}
              className="w-full bg-black/40 border border-white/5 text-gray-200 rounded-xl text-xs py-1.5 px-2.5 outline-none focus:border-indigo-500/50 transition-colors"
            >
              <option value="1">Every second</option>
              <option value="2">Every 2 seconds</option>
              <option value="5">Every 5 seconds</option>
            </select>
          </div>

          {/* Tick Sound Type */}
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-gray-400 block">Tick Sound</span>
            {settings.soundType !== 'custom' ? (
              <select
                value={settings.soundType}
                onChange={(e) => onChange({ ...settings, soundType: e.target.value })}
                className="w-full bg-black/40 border border-white/5 text-gray-200 rounded-xl text-xs py-1.5 px-2.5 outline-none focus:border-indigo-500/50 transition-colors"
              >
                <option value="paper">Mechanical Click</option>
                <option value="clock">Clock Tick</option>
                <option value="digital">Digital Beep</option>
                <option value="custom">Custom MP3...</option>
              </select>
            ) : (
              <AudioUpload
                onAudioSelect={handleTickAudioSelect}
                onRemove={removeTickAudio}
                currentFile={settings.customTickSound}
              />
            )}
          </div>

          {/* End Sound Type */}
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-gray-400 block">Alarm Sound</span>
            {settings.endSoundType !== 'custom' ? (
              <select
                value={settings.endSoundType}
                onChange={(e) => onChange({ ...settings, endSoundType: e.target.value })}
                className="w-full bg-black/40 border border-white/5 text-gray-200 rounded-xl text-xs py-1.5 px-2.5 outline-none focus:border-indigo-500/50 transition-colors"
              >
                <option value="trumpet">Trumpet Fanfare</option>
                <option value="bell">Metallic Bell</option>
                <option value="chime">Wind Chime</option>
                <option value="custom">Custom MP3...</option>
              </select>
            ) : (
              <AudioUpload
                onAudioSelect={handleEndAudioSelect}
                onRemove={removeEndAudio}
                currentFile={settings.customEndSound}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}