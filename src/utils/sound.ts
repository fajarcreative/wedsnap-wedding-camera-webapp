// Web Audio API mechanical shutter click sound generator
export function playShutterSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // 1. First mechanical click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.04);

    // 2. Mirror flip / mechanical winding noise
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(ctx.currentTime + 0.02);

    // 3. Second shutter close snap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(450, ctx.currentTime + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.06);
    osc2.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.debug('Audio not allowed yet or not supported', err);
  }
}

