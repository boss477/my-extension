import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerSettings from './TimerSettings';
import TimeInput from './TimeInput';
import SoundSettings from './SoundSettings';
import { playSynthesizedSound } from '../utils/audioSynth';

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
  const [soundSettings, setSoundSettings] = useState<SoundConfig>({
    enabled: true,
    volume: 0.5,
    tickInterval: 1,
    soundType: 'paper',
    endSoundType: 'trumpet'
  });

  const timerRef = useRef<number>();

  // Helper to play sounds safely
  const playTick = () => {
    if (soundSettings.enabled) {
      if (soundSettings.soundType === 'custom' && soundSettings.customTickSound) {
        const audio = new Audio(URL.createObjectURL(soundSettings.customTickSound));
        audio.volume = soundSettings.volume;
        audio.play().catch(() => {});
      } else {
        playSynthesizedSound(soundSettings.soundType, soundSettings.volume);
      }
    }
  };

  const playEnd = () => {
    if (soundSettings.enabled) {
      if (soundSettings.endSoundType === 'custom' && soundSettings.customEndSound) {
        const audio = new Audio(URL.createObjectURL(soundSettings.customEndSound));
        audio.volume = soundSettings.volume;
        audio.play().catch(() => {});
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

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SavedState;
          setSoundSettings((prev) => ({
            ...prev,
            ...parsed.soundSettings
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
      }
    };
    loadState();
  }, []);

  // Save state on change
  useEffect(() => {
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
  }, [time, initialTime, isRunning, isPaused, soundSettings]);

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

  return (
    <div className="w-full max-w-xs bg-[#0E0E12]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col items-center gap-4 relative overflow-hidden select-none">
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