let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthesizedSound(type: string, volume: number) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create master gain node for volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (type === 'paper' || type === 'mechanical') {
      // Paper flip/Mechanical click: synthesized using a quick noise burst
      const bufferSize = ctx.sampleRate * 0.02; // 20ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 0.02);

    } else if (type === 'clock') {
      // Classic woodblock clock tick: sine sweep from 1000Hz to 100Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + 0.04);

    } else if (type === 'digital') {
      // Clean high beep: 2000Hz sine wave
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.06);

    } else if (type === 'bell') {
      // Bell: Metallic inharmonic frequencies decaying slowly
      const frequencies = [440, 554.37, 659.25, 880, 1200, 1600];
      const gains = [0.5, 0.3, 0.25, 0.15, 0.1, 0.05];
      
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[index] * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.6);
      });

    } else if (type === 'chime') {
      // Wind chime arpeggio: 3 ascending high tones played with small delays
      const notes = [880, 1100, 1320]; // A5, C#6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });

    } else if (type === 'trumpet') {
      // Trumpet / Alarm fanfare: Bright arpeggio style beep sequence
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.15;
        
        osc.type = 'triangle'; // triangle has softer harmonics, sounds slightly brassy
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, startTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    }
  } catch (error) {
    console.error('Audio synthesis failed:', error);
  }
}
