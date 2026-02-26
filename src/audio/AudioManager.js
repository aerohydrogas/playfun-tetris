import { start, sequence, note } from '@strudel/web';

export class AudioManager {
    constructor() {
        this.scheduler = null;
        this.isMuted = false;
        
        // Simple SFX synth (can be improved or replaced with samples)
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    startMusic() {
        if (this.scheduler) return;

        // Fast cyberpunk-ish beat
        // Using a basic synth pattern available in Strudel
        // This is a placeholder for a complex composition
        this.scheduler = sequence(
            [
                note("c3").s("sawtooth").lowpass(2000),
                note("eb3").s("sawtooth").lowpass(1500),
                note("g3").s("sawtooth").lowpass(3000),
                note("bb3").s("sawtooth").lowpass(2500)
            ]
        )
        .stack(
            sequence("bd sd bd sd").s("gm_drums").bank("TR-808")
        )
        .cpm(140) // Fast tempo
        .loop()
        .play();
    }

    stopMusic() {
        if (this.scheduler) {
            this.scheduler.stop();
            this.scheduler = null;
        }
    }

    playSFX(type) {
        if (this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        
        switch (type) {
            case 'move':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
                
            case 'rotate':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
                
            case 'drop':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'clear':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
                
            case 'gameover':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 1.0);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
                break;
        }
    }
}
