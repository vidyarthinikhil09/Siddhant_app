export class AudioController {
  private ctx: AudioContext | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Silently ignore if browser blocks auto-play
      });
    }
  }

  public playDrone() {
    this.init();
    if (!this.ctx) return;
    
    this.stopDrone(); // Stop any existing drone

    const t = this.ctx.currentTime;
    
    this.droneGain = this.ctx.createGain();
    
    // Subtle volume
    this.droneGain.gain.setValueAtTime(0, t);
    this.droneGain.gain.linearRampToValueAtTime(0.06, t + 2); 
    this.droneGain.connect(this.ctx.destination);

    // Low, mysterious drone - Oscillator 1
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.41, t); // C2
    osc1.connect(this.droneGain);
    osc1.start(t);
    
    // Oscillator 2 for richness
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(65.41 * 1.501, t); // Perfect fifth slightly detuned
    
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.02, t);
    osc2.connect(osc2Gain);
    osc2Gain.connect(this.droneGain);
    osc2.start(t);

    this.droneOscillators = [osc1, osc2];
  }

  public stopDrone() {
    if (this.droneOscillators.length > 0 && this.droneGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(t);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
      this.droneGain.gain.linearRampToValueAtTime(0, t + 1);
      
      this.droneOscillators.forEach(osc => osc.stop(t + 1));
      
      this.droneOscillators = [];
      this.droneGain = null;
    }
  }

  public playTick() {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Soft glass-like tick
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playSuccess() {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Ethereal chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.3); // G5

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain.gain.setValueAtTime(0.1, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.5);
  }
}

export const audio = new AudioController();
