/**
 * Web Audio API synthesizer for in-cabin acoustic chimes and ambient playback
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Executive two-tone harmonic chime when a passenger submits a request
export function playCabinChime(type: 'song' | 'comfort' | 'acknowledged' | 'tap' = 'song') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (type === 'comfort') {
      // Soft gentle 3-tone airline cabin bell: E5 -> G#5 -> B5
      const notes = [659.25, 830.61, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
      return;
    }

    if (type === 'acknowledged') {
      // Driver acknowledged: Warm ascending luxury chord
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.85);
      });
      return;
    }

    // Default 'song' request chime: High executive dual bell
    const f1 = 587.33; // D5
    const f2 = 880.0;  // A5
    [f1, f2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0, now + i * 0.14);
      gain.gain.linearRampToValueAtTime(0.14, now + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.75);
    });
  } catch (err) {
    console.debug('Audio chime suppressed or not allowed yet:', err);
  }
}

// Background Ambient Music Generator for the Jukebox
class AmbientSynthesizer {
  private timer: number | null = null;
  private isPlaying = false;
  private volume = 0.5;
  private masterGain: GainNode | null = null;
  private chordIndex = 0;
  private style: 'ambient' | 'chill' | 'lofi' | 'smooth' | 'jazz' = 'ambient';

  private chordProgressions: Record<string, number[][]> = {
    ambient: [
      [220, 261.63, 329.63, 392],    // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196, 246.94], // Cmaj7
      [196, 246.94, 293.66, 349.23], // G7
    ],
    chill: [
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [220, 261.63, 329.63, 392],    // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [196, 246.94, 293.66, 392],    // G
    ],
    lofi: [
      [293.66, 349.23, 440, 523.25], // Dm9
      [196, 246.94, 293.66, 349.23], // G7
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [220, 261.63, 329.63, 392],    // Am7
    ],
    smooth: [
      [220, 277.18, 329.63, 415.3],  // Amaj7
      [185.0, 220, 277.18, 329.63],  // F#m7
      [146.83, 185.0, 220, 277.18],  // Dmaj7
      [164.81, 207.65, 246.94, 329.63], // E
    ],
    jazz: [
      [293.66, 349.23, 440, 523.25], // Dm7
      [196, 246.94, 293.66, 349.23], // G13
      [261.63, 329.63, 392, 493.88], // Cmaj7#11
      [220, 277.18, 329.63, 392],    // A7alt
    ],
  };

  public setStyle(style: 'ambient' | 'chill' | 'lofi' | 'smooth' | 'jazz') {
    this.style = style;
    this.chordIndex = 0;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.18, audioCtx.currentTime);
    }
  }

  public start() {
    if (this.isPlaying) return;
    try {
      const ctx = getAudioContext();
      this.isPlaying = true;
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.18, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      this.playNextChord();
      this.timer = window.setInterval(() => {
        this.playNextChord();
      }, 3200);
    } catch (e) {
      console.warn('Synthesizer failed to start:', e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private playNextChord() {
    if (!this.isPlaying) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const progression = this.chordProgressions[this.style] || this.chordProgressions.ambient;
      const chord = progression[this.chordIndex % progression.length];
      this.chordIndex++;

      // Play soft padded tones
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 1.2);
        filter.frequency.linearRampToValueAtTime(600, now + 3.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);

        osc.connect(filter);
        filter.connect(gain);
        if (this.masterGain) {
          gain.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + 3.15);
      });
    } catch (e) {
      console.debug('Chord play skip:', e);
    }
  }
}

export const cabinSynth = new AmbientSynthesizer();
