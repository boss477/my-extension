import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Play, Pause, RotateCcw, Move } from 'lucide-react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerSettings from './TimerSettings';
import TimeInput from './TimeInput';
import SoundSettings from './SoundSettings';
import { playSynthesizedSound, setCustomSoundBuffer, clearCustomSoundBuffer } from '../utils/audioSynth';
import { getSound, saveSound, deleteSound } from '../utils/db';

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  tickInterval: number;
  soundType: string;
  endSoundType: string;
  customTickSound?: File;
  customEndSound?: File;
}

const STORAGE_KEY = 'focus_timer_state';

interface SavedState {
  timeRemaining: number;
  initialTime: number;
  endTime: number;
  isRunning: boolean;
  isPaused: boolean;
  soundSettings: {
    enabled: boolean;
    volume: number;
    tickInterval: number;
    soundType: string;
    endSoundType: string;
  };
}

export default function Timer() {
  const [time, setTime] = useState(360); // 6 minutes in seconds
  const [initialTime, setInitialTime] = useState(360);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundSettings, setSoundSettings] = useState<SoundConfig>({
    enabled: true,
    volume: 0.5,
    tickInterval: 1,
    soundType: 'paper',
    endSoundType: 'trumpet'
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, option, label, [role="slider"]')) {
      return;
    }
    isDraggingRef.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = { x: position.x, y: position.y };
    
    document.body.style.cursor = 'grabbing';
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
  };

  useEffect(() => {
    const handlePointerMoveGlobal = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = elementStart.current.x + dx;
      const newY = elementStart.current.y + dy;
      
      positionRef.current = { x: newX, y: newY };
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handlePointerUpGlobal = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      if (containerRef.current) {
        containerRef.current.style.transition = '';
      }
      setPosition(positionRef.current);
    };

    window.addEventListener('pointermove', handlePointerMoveGlobal);
    window.addEventListener('pointerup', handlePointerUpGlobal);

    return () => {
      window.removeEventListener('pointermove', handlePointerMoveGlobal);
      window.removeEventListener('pointerup', handlePointerUpGlobal);
    };
  }, []);

  const timerRef = useRef<number>();

  // Helper to play sounds safely
  const playTick = () => {
    if (soundSettings.enabled) {
      if (soundSettings.soundType === 'custom' && soundSettings.customTickSound) {
        playSynthesizedSound('custom-tick', soundSettings.volume);
      } else {
        playSynthesizedSound(soundSettings.soundType, soundSettings.volume);
      }
    }
  };

  const playEnd = () => {
    if (soundSettings.enabled) {
      if (soundSettings.endSoundType === 'custom' && soundSettings.customEndSound) {
        playSynthesizedSound('custom-end', soundSettings.volume);
      } else {
        playSynthesizedSound(soundSettings.endSoundType, soundSettings.volume);
      }
    }
  };

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      let saved: string | null = null;
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const data = await new Promise<any>((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (res) => resolve(res[STORAGE_KEY]));
          });
          if (data) {
            saved = JSON.stringify(data);
          }
        } else {
          saved = localStorage.getItem(STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Storage read not available:', err);
      }

      // Always load custom files from IndexedDB on startup
      let customTickSound: File | null = null;
      let customEndSound: File | null = null;
      try {
        customTickSound = await getSound('customTickSound');
        customEndSound = await getSound('customEndSound');
      } catch (err) {
        console.warn('IndexedDB read not available:', err);
      }

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setSoundSettings((prev) => ({
            ...prev,
            ...parsed.soundSettings,
            customTickSound: customTickSound || undefined,
            customEndSound: customEndSound || undefined
          }));
          setInitialTime(parsed.initialTime || 360);
          
          if (parsed.isRunning) {
            const remaining = Math.max(0, Math.floor((parsed.endTime - Date.now()) / 1000));
            if (remaining > 0) {
              setTime(remaining);
              setIsRunning(true);
              setIsPaused(false);
            } else {
              setTime(0);
              setIsRunning(false);
              setIsPaused(false);
            }
          } else {
            setTime(parsed.timeRemaining);
            setIsRunning(parsed.isRunning);
            setIsPaused(parsed.isPaused);
          }
        } catch (e) {
          console.error('Error parsing saved state:', e);
        }
      } else if (customTickSound || customEndSound) {
        // If there is no saved general state but custom sounds exist in DB, still set them
        setSoundSettings((prev) => ({
          ...prev,
          customTickSound: customTickSound || undefined,
          customEndSound: customEndSound || undefined
        }));
      }
      setIsLoaded(true);
    };
    loadState();
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isLoaded) return;
    const saveState = async () => {
      const stateToSave: SavedState = {
        timeRemaining: time,
        initialTime: initialTime,
        endTime: isRunning && !isPaused ? Date.now() + time * 1000 : 0,
        isRunning,
        isPaused,
        soundSettings: {
          enabled: soundSettings.enabled,
          volume: soundSettings.volume,
          tickInterval: soundSettings.tickInterval,
          soundType: soundSettings.soundType,
          endSoundType: soundSettings.endSoundType,
        }
      };

      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [STORAGE_KEY]: stateToSave });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
      } catch (err) {
        console.warn('Storage write not available:', err);
      }
    };
    saveState();
  }, [time, initialTime, isRunning, isPaused, soundSettings, isLoaded]);

  // Synchronize custom sound files with IndexedDB and Audio Context buffers
  useEffect(() => {
    if (!isLoaded) return;
    if (soundSettings.customTickSound) {
      saveSound('customTickSound', soundSettings.customTickSound)
        .then(() => setCustomSoundBuffer('tick', soundSettings.customTickSound!))
        .catch(err => console.error('Error saving custom tick sound:', err));
    } else {
      deleteSound('customTickSound')
        .then(() => clearCustomSoundBuffer('tick'))
        .catch(err => console.error('Error deleting custom tick sound:', err));
    }
  }, [soundSettings.customTickSound, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (soundSettings.customEndSound) {
      saveSound('customEndSound', soundSettings.customEndSound)
        .then(() => setCustomSoundBuffer('end', soundSettings.customEndSound!))
        .catch(err => console.error('Error saving custom end sound:', err));
    } else {
      deleteSound('customEndSound')
        .then(() => clearCustomSoundBuffer('end'))
        .catch(err => console.error('Error deleting custom end sound:', err));
    }
  }, [soundSettings.customEndSound, isLoaded]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning && !isPaused && time > 0) {
      timerRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsPaused(false);
            playEnd();
            return 0;
          }
          const nextTime = prevTime - 1;
          if (nextTime % soundSettings.tickInterval === 0) {
            playTick();
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused, soundSettings]);

  const toggleTimer = () => {
    if (time === 0) {
      setTime(360);
      setInitialTime(360);
    }
    setIsRunning(!isRunning);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setTime(360);
    setInitialTime(360);
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleTimeSet = (seconds: number) => {
    setTime(seconds);
    setInitialTime(seconds);
    setShowSettings(false);
    setIsRunning(true);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        className="w-36 h-9 bg-[#0E0E12]/95 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-2 shadow-[0_4px_20px_0_rgba(0,0,0,0.5)] flex items-center justify-between select-none relative overflow-hidden transition-all duration-300"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-indigo-500/15 rounded-full blur-[12px] pointer-events-none" />

        {/* Left Side: Draggable Handle & Time */}
        <div
          onPointerDown={handlePointerDown}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing z-10 flex-1 py-1"
          title="Drag to move"
        >
          <Move className="w-2.5 h-2.5 text-gray-500" />
          <span
            className="text-[13px] font-bold text-white tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 8px rgba(255, 255, 255, 0.1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(time)}
          </span>
        </div>

        {/* Right Side: Interactive Action Buttons */}
        <div className="flex items-center gap-1 z-10">
          <button
            onClick={toggleTimer}
            className={`p-1 rounded-full border transition-all duration-200 ${
              isRunning && !isPaused
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/25'
            }`}
            title={isRunning && !isPaused ? "Pause" : "Start"}
          >
            {isRunning && !isPaused ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Expand to Normal"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: 'grab'
      }}
      className="relative select-none overflow-hidden transition-all duration-300 flex flex-col items-center gap-4 w-full max-w-xs bg-[#0E0E12]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"
    >
      {/* Visual Ambient Glows */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />

      <TimerDisplay
        time={time}
        initialTime={initialTime}
        showSettings={showSettings}
        showSoundSettings={showSoundSettings}
        onSettingsToggle={() => {
          setShowSettings(!showSettings);
          setShowSoundSettings(false);
        }}
        onSoundSettingsToggle={() => {
          setShowSoundSettings(!showSoundSettings);
          setShowSettings(false);
        }}
        isMinimized={isMinimized}
        onMinimizeToggle={() => setIsMinimized(true)}
      />
      
      {/* Form Input for Time */}
      <div className="w-full z-10">
        <TimeInput onTimeSet={handleTimeSet} />
      </div>
      
      {/* Control Buttons */}
      <div className="w-full z-10">
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          onToggle={toggleTimer}
          onPause={handlePause}
          onReset={handleReset}
        />
      </div>

      {/* Preset Settings Panel */}
      {showSettings && (
        <div className="w-full z-20 transition-all duration-300">
          <TimerSettings onTimeSet={handleTimeSet} />
        </div>
      )}

      {/* Sound Settings Panel */}
      {showSoundSettings && (
        <div className="w-full z-20 transition-all duration-300">
          <SoundSettings
            settings={soundSettings}
            onChange={setSoundSettings}
          />
        </div>
      )}
    </div>
  );
}