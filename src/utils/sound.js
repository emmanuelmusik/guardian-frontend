// A short two-tone chime, generated on the fly — no audio file needed.
// Used to catch someone's attention when a call starts in their community.
export function playCallChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.connect(ctx.destination);

    const first = ctx.createOscillator();
    first.frequency.value = 880;
    first.connect(gain);
    first.start();
    first.stop(ctx.currentTime + 0.15);

    setTimeout(() => {
      const second = ctx.createOscillator();
      second.frequency.value = 1108;
      second.connect(gain);
      second.start();
      second.stop(ctx.currentTime + 0.18);
    }, 170);
  } catch {
    // Web Audio unsupported or blocked — silently skip, the visual
    // notification still gets through.
  }
}
