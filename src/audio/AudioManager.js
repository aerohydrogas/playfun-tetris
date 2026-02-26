import {
  note,
  s,
  stack,
  choose
} from '@strudel/web';

export class AudioManager {
  constructor() {
    this.initialized = false;
    this.isMuted = false;
    this.scheduler = null;
  }

  async init() {
    if (this.initialized) return;
    try {
      console.log('Audio: Initialized');
      this.initialized = true;
      this.playBGM();
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  }

  playBGM() {
    if (!this.initialized || this.scheduler || this.isMuted) return;

    // Neon Chillwave / Synthwave ambient
    const bass = note("c2 eb2 g2 bb2")
      .s("sawtooth")
      .lpf(s("200 600").slow(16)) // Slow filter sweep
      .legato(1)
      .gain(0.15)
      .slow(4);

    const pads = note("c4 eb4 g4")
      .s("triangle")
      .lpf(800)
      .decay(2)
      .sustain(0.5)
      .gain(0.1)
      .slow(8);
      
    const arps = note("c5 eb5 g5 bb5 c6")
      .s("sine")
      .velocity(choose(0.1, 0)) 
      .fast(2)
      .gain(0.05);

    this.scheduler = stack(bass, pads, arps).play();
  }

  stopBGM() {
    if (this.scheduler) {
      this.scheduler.stop();
      this.scheduler = null;
    }
  }

  playSFX(key) {
    if (this.isMuted || !this.initialized) return;
    
    // Simple synth SFX
    if (key === 'rotate') {
       s("sine").freq(440).decay(0.05).gain(0.1).play();
    } else if (key === 'move') {
       s("noise").decay(0.02).gain(0.05).play();
    } else if (key === 'lock') {
       s("sawtooth").lpf(200).decay(0.1).gain(0.2).play();
    } else if (key === 'clear') {
       note("c5 e5 g5 c6").s("sine").fast(16).decay(0.2).gain(0.1).play();
    } else if (key === 'gameover') {
       note("c3 bb2 g2 eb2 c2").s("sawtooth").slow(2).decay(1).gain(0.2).play();
       this.stopBGM();
    }
  }
}

export const audioManager = new AudioManager();
