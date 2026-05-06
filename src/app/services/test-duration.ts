// Stepped duration adjustments for the +/- buttons next to the timer.
//
// As the configured duration grows, individual steps grow with it: 1s tweaks
// matter at 5s, but at an hour you want 5-minute jumps. Each tier defines an
// upper bound (`seconds`) below which the corresponding `delta` applies; the
// `seconds: -1` sentinel covers everything beyond the largest threshold.
interface Breakpoint {
  seconds: number;
  delta: number;
}

const BREAKPOINTS: readonly Breakpoint[] = [
  { seconds: 1, delta: 0 },
  { seconds: 5, delta: 1 },
  { seconds: 30, delta: 5 },
  { seconds: 120, delta: 15 },
  { seconds: 300, delta: 30 },
  { seconds: 600, delta: 60 },
  { seconds: 1800, delta: 300 },
  { seconds: 3600, delta: 600 },
  { seconds: 86400, delta: 3600 },
  { seconds: -1, delta: 7200 },
];

// `Down`: the step we take when decreasing the timer. Uses `<=` so that at a
// boundary we shrink by the smaller (current-tier) amount, not the next one.
export function nextDurationDown(current: number): number {
  for (const bp of BREAKPOINTS) {
    if (current <= bp.seconds || bp.seconds === -1) {
      return Math.max(0, current - bp.delta);
    }
  }
  return current;
}

// `Up`: uses strict `<` so jumping from a boundary goes to the larger tier.
export function nextDurationUp(current: number): number {
  for (const bp of BREAKPOINTS) {
    if (current < bp.seconds || bp.seconds === -1) {
      return current + bp.delta;
    }
  }
  return current;
}
