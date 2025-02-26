import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Timer, Volume2, Pause, Play, RefreshCw, ChevronUp, ChevronDown, Settings, Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';

type SoundPreset = {
  name: string;
  url: string;
};

type TimerPreset = {
  name: string;
  seconds: number;
};

function App() {
  const [time, setTime] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [soundInterval, setSoundInterval] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customSound, setCustomSound] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isLargeDisplay, setIsLargeDisplay] = useState(false);
  const [selectedTimerPreset, setSelectedTimerPreset] = useState(0);
  const intervalRef = useRef<number>();
  const lastSoundRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number }>({
    isDragging: false,
    startX: 0,
    startY: 0
  });

  const soundPresets: SoundPreset[] = [
    { name: 'Tick', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
    { name: 'Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { name: 'Click', url: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3' },
  ];

  const timerPresets: TimerPreset[] = [
    { name: '1 min', seconds: 60 },
    { name: '3 min', seconds: 180 },
    { name: '5 min', seconds: 300 },
    { name: '10 min', seconds: 600 },
  ];

  useEffect(() => {
    const audio = new Audio(customSound || soundPresets[selectedPreset].url);
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [customSound, selectedPreset, volume]);

  const playSound = () => {
    if (audioRef.current && soundEnabled) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.log('Audio play failed:', err));
      }
    }
  };

  const previewSound = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.log('Audio preview failed:', err));
      }
    }
  };

  useEffect(() => {
    if (isRunning) {
      let lastTick = Math.floor(Date.now() / 1000);
      
      intervalRef.current = window.setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        
        setTime(prev => {
          if (prev >= targetTime && targetTime !== 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            playSound();
            return prev;
          }
          
          if (soundEnabled && now !== lastTick && now % soundInterval === 0) {
            playSound();
            lastTick = now;
          }
          
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, soundEnabled, targetTime, soundInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomSound = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomSound(url);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY
      });
    }
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  const selectTimerPreset = (index: number) => {
    if (index >= 0 && index < timerPresets.length) {
      setSelectedTimerPreset(index);
      setTargetTime(timerPresets[index].seconds);
    }
  };

  const navigateTimerPreset = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const nextIndex = (selectedTimerPreset + 1) % timerPresets.length;
      selectTimerPreset(nextIndex);
    } else {
      const prevIndex = selectedTimerPreset === 0 ? timerPresets.length - 1 : selectedTimerPreset - 1;
      selectTimerPreset(prevIndex);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div 
      className="floating-window"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <div className="bg-gray-800/95 rounded-xl shadow-xl p-3 w-full h-full select-none relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">AI Timer</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsLargeDisplay(!isLargeDisplay)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              {isLargeDisplay ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`transition-colors ${
                soundEnabled ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showSettings ? (
          <div className="p-2 bg-gray-700/50 rounded-lg text-[10px] space-y-1.5">
            <div>
              <label className="block text-gray-300 mb-1">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Sound</label>
              <div className="flex gap-1">
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(parseInt(e.target.value))}
                  className="flex-1 bg-gray-600/50 text-gray-200 rounded px-1.5 py-0.5"
                >
                  {soundPresets.map((preset, index) => (
                    <option key={index} value={index}>{preset.name}</option>
                  ))}
                </select>
                <button 
                  onClick={previewSound}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-1.5 py-0.5 rounded transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Custom Sound</label>
              <input
                type="file"
                accept="audio/mp3,audio/wav"
                onChange={handleCustomSound}
                className="w-full text-[8px] text-gray-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[8px] file:bg-blue-500/20 file:text-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Timer Presets</label>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => navigateTimerPreset('prev')}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <select
                  value={selectedTimerPreset}
                  onChange={(e) => selectTimerPreset(parseInt(e.target.value))}
                  className="flex-1 bg-gray-600/50 text-gray-200 rounded px-1.5 py-0.5"
                >
                  {timerPresets.map((preset, index) => (
                    <option key={index} value={index}>{preset.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => navigateTimerPreset('next')}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full text-center mb-3">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                <button
                  onClick={() => !isRunning && setTargetTime(prev => Math.max(0, prev + 60))}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isRunning}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => !isRunning && setTargetTime(prev => Math.max(0, prev - 60))}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isRunning}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className={`font-mono font-medium text-gray-200 ${isLargeDisplay ? 'text-5xl' : 'text-3xl'}`}>
                {formatTime(time)}
              </div>
              {targetTime > 0 && !isRunning && (
                <div className="text-[10px] text-gray-400 mt-1">
                  Target: {formatTime(targetTime)}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-1.5 rounded-full transition-colors ${
                  isRunning
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTime(0);
                  setTargetTime(0);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {!isRunning && (
              <div className="flex mt-2 gap-1">
                <button 
                  onClick={() => navigateTimerPreset('prev')}
                  className="text-gray-400 hover:text-gray-300 p-0.5"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <div className="text-[10px] text-gray-300">
                  {timerPresets[selectedTimerPreset].name}
                </div>
                <button 
                  onClick={() => navigateTimerPreset('next')}
                  className="text-gray-400 hover:text-gray-300 p-0.5"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;