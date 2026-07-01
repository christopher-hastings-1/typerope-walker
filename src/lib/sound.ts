export type SoundType =
  | "submit"
  | "perfect"
  | "streak"
  | "collect"
  | "hazard"
  | "fall"
  | "win"
  | "tick"
  | "wind"
  | "warning";

const MUTE_KEY = "tightrope_muted";

let _ctx: AudioContext | null = null;
let _muted: boolean | null = null;
const muteListeners = new Set<() => void>();

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    _ctx = new C();
  }
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

export function isMuted(): boolean {
  if (_muted !== null) return _muted;
  if (typeof window === "undefined") return false;
  _muted = window.localStorage.getItem(MUTE_KEY) === "1";
  return _muted;
}

export function setMuted(v: boolean) {
  _muted = v;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  }
  muteListeners.forEach((fn) => fn());
}

export function subscribeMute(fn: () => void) {
  muteListeners.add(fn);
  return () => muteListeners.delete(fn);
}

export function playSound(type: SoundType) {
  if (isMuted()) return;
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const g = c.createGain();
    g.connect(c.destination);

    switch (type) {
      case "submit": {
        const o = c.createOscillator();
        o.connect(g);
        o.type = "triangle";
        o.frequency.setValueAtTime(220, now);
        o.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        o.start(now);
        o.stop(now + 0.22);
        break;
      }
      case "perfect": {
        [0, 0.08].forEach((delay, i) => {
          const o = c.createOscillator();
          o.connect(g);
          o.type = "sine";
          o.frequency.setValueAtTime([523, 784][i], now + delay);
          g.gain.setValueAtTime(0.22, now + delay);
          g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
          o.start(now + delay);
          o.stop(now + delay + 0.4);
        });
        break;
      }
      case "streak": {
        [0, 0.1, 0.2].forEach((delay, i) => {
          const o = c.createOscillator();
          const sg = c.createGain();
          o.connect(sg);
          sg.connect(c.destination);
          o.type = "sine";
          o.frequency.setValueAtTime([440, 554, 659][i], now + delay);
          sg.gain.setValueAtTime(0.18, now + delay);
          sg.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
          o.start(now + delay);
          o.stop(now + delay + 0.35);
        });
        break;
      }
      case "collect": {
        const o = c.createOscillator();
        o.connect(g);
        o.type = "sine";
        o.frequency.setValueAtTime(880, now);
        o.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now);
        o.stop(now + 0.3);
        break;
      }
      case "hazard": {
        const o = c.createOscillator();
        o.connect(g);
        o.type = "sawtooth";
        o.frequency.setValueAtTime(180, now);
        o.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        o.start(now);
        o.stop(now + 0.22);
        break;
      }
      case "fall": {
        const buf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++)
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        const src = c.createBufferSource();
        src.buffer = buf;
        const flt = c.createBiquadFilter();
        flt.type = "bandpass";
        flt.frequency.value = 400;
        flt.Q.value = 0.8;
        src.connect(flt);
        flt.connect(g);
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        src.start(now);
        src.stop(now + 0.6);
        const o2 = c.createOscillator();
        o2.connect(g);
        o2.type = "sine";
        o2.frequency.setValueAtTime(120, now);
        o2.frequency.exponentialRampToValueAtTime(40, now + 0.35);
        o2.start(now);
        o2.stop(now + 0.35);
        break;
      }
      case "win": {
        [0, 0.12, 0.24, 0.36].forEach((delay, i) => {
          const o = c.createOscillator();
          const wg = c.createGain();
          o.connect(wg);
          wg.connect(c.destination);
          o.type = "triangle";
          o.frequency.setValueAtTime([392, 523, 659, 784][i], now + delay);
          wg.gain.setValueAtTime(0.22, now + delay);
          wg.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
          o.start(now + delay);
          o.stop(now + delay + 0.45);
        });
        break;
      }
      case "tick": {
        const o = c.createOscillator();
        o.connect(g);
        o.type = "square";
        o.frequency.setValueAtTime(1200, now);
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        o.start(now);
        o.stop(now + 0.04);
        break;
      }
      case "wind": {
        const buf = c.createBuffer(1, c.sampleRate * 1.2, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const flt = c.createBiquadFilter();
        flt.type = "bandpass";
        flt.frequency.value = 600;
        flt.Q.value = 0.5;
        src.connect(flt);
        flt.connect(g);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.25, now + 0.4);
        g.gain.linearRampToValueAtTime(0.001, now + 1.2);
        src.start(now);
        src.stop(now + 1.2);
        break;
      }
      case "warning": {
        const o = c.createOscillator();
        o.connect(g);
        o.type = "sine";
        o.frequency.setValueAtTime(80, now);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now);
        o.stop(now + 0.3);
        break;
      }
    }
  } catch {
    /* ignore */
  }
}
