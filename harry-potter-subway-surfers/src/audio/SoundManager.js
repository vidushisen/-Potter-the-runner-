/* SoundManager.js - Web Audio Synthesizer with 100% Node Cleanup to Prevent Audio Lockups */

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.musicTimeout = null;
    this.isPlayingMusic = false;
    this.currentNoteIndex = 0;

    // Auto-init AudioContext on first user interaction
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  playCoinSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, now);
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playJumpSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.16);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSlideSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSpellSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);
      
      gain.gain.setValueAtTime(0.3, now + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.14);
      
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      
      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 0.14);
    });
  }

  playSnitchSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  playCrashSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /* Full Authentic Hedwig's Theme Movie Soundtrack Loop */
  startMusic() {
    if (this.isMuted) return;
    this.init();
    
    if (this.isPlayingMusic) {
      this.stopMusic();
    }
    this.isPlayingMusic = true;
    this.currentNoteIndex = 0;

    const hedwigMelody = [
      { note: 493.88, bass: 164.81, duration: 0.45, pause: 0.10 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.85, pause: 0.10 },
      { note: 880.00, bass: 220.00, duration: 0.85, pause: 0.12 },
      { note: 739.99, bass: 185.00, duration: 0.85, pause: 0.15 },
      
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 587.33, bass: 146.83, duration: 0.65, pause: 0.08 },
      { note: 698.46, bass: 174.61, duration: 0.65, pause: 0.08 },
      { note: 493.88, bass: 123.47, duration: 0.95, pause: 0.25 },

      { note: 493.88, bass: 164.81, duration: 0.45, pause: 0.10 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.85, pause: 0.10 },
      { note: 1174.66, bass: 293.66, duration: 0.85, pause: 0.10 },
      { note: 1108.73, bass: 277.18, duration: 0.85, pause: 0.10 },
      
      { note: 1046.50, bass: 261.63, duration: 0.70, pause: 0.08 },
      { note: 830.61, bass: 207.65, duration: 0.65, pause: 0.08 },
      { note: 1046.50, bass: 261.63, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.35, pause: 0.05 },
      { note: 932.33, bass: 233.08, duration: 0.35, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.65, pause: 0.08 },
      { note: 659.25, bass: 164.81, duration: 1.10, pause: 0.30 },
    ];

    const playStep = () => {
      if (!this.isPlayingMusic || this.isMuted || !this.ctx) return;

      const item = hedwigMelody[this.currentNoteIndex];
      const now = this.ctx.currentTime;

      // Primary Celesta Synth Note
      const celestaOsc = this.ctx.createOscillator();
      const celestaGain = this.ctx.createGain();
      celestaOsc.type = 'sine';
      celestaOsc.frequency.setValueAtTime(item.note, now);
      celestaGain.gain.setValueAtTime(0.28, now);
      celestaGain.gain.exponentialRampToValueAtTime(0.001, now + item.duration);
      celestaOsc.connect(celestaGain);
      celestaGain.connect(this.masterGain);

      celestaOsc.onended = () => {
        celestaOsc.disconnect();
        celestaGain.disconnect();
      };

      celestaOsc.start(now);
      celestaOsc.stop(now + item.duration);

      // Bass Accompaniment
      if (item.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(item.bass, now);
        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + item.duration + 0.05);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);

        bassOsc.onended = () => {
          bassOsc.disconnect();
          bassGain.disconnect();
        };

        bassOsc.start(now);
        bassOsc.stop(now + item.duration + 0.05);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % hedwigMelody.length;

      const totalTimeMs = (item.duration + item.pause) * 1000;
      this.musicTimeout = setTimeout(playStep, totalTimeMs);
    };

    playStep();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }
}
