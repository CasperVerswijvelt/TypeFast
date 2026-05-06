import { nextDurationDown, nextDurationUp } from './test-duration';

describe('test-duration', () => {
  describe('nextDurationUp', () => {
    // The first tier `{ seconds: 1, delta: 0 }` makes 0 a fixed point — values
    // below 1s never grow. The next tier kicks in at 1s with a 1s step.
    it('keeps 0 at 0 (delta-0 tier)', () => {
      expect(nextDurationUp(0)).toBe(0);
    });

    it('jumps from a tier boundary up using the next tier delta', () => {
      // 1 is the boundary into the +1 tier (current < 5)
      expect(nextDurationUp(1)).toBe(2);
      // 5 is the boundary into the +5 tier (current < 30)
      expect(nextDurationUp(5)).toBe(10);
      // 30 is the boundary into the +15 tier (current < 120)
      expect(nextDurationUp(30)).toBe(45);
      // 300 is the boundary into the +60 tier (current < 600)
      expect(nextDurationUp(300)).toBe(360);
      // 600 is the boundary into the +300 tier (current < 1800)
      expect(nextDurationUp(600)).toBe(900);
      // 86400 is the boundary into the +7200 catch-all tier
      expect(nextDurationUp(86400)).toBe(93600);
    });

    it('uses the current tier delta when below the boundary', () => {
      // 4 is still inside the +1 tier (current < 5)
      expect(nextDurationUp(4)).toBe(5);
      // 60 is inside the +15 tier (current < 120)
      expect(nextDurationUp(60)).toBe(75);
      // 1800 is inside the +600 tier (current < 3600)
      expect(nextDurationUp(1800)).toBe(2400);
      // 3600 is inside the +3600 tier (current < 86400)
      expect(nextDurationUp(3600)).toBe(7200);
    });

    it('falls through to the catch-all tier for very large values', () => {
      expect(nextDurationUp(100000)).toBe(107200);
    });

    it('always returns a non-decreasing value', () => {
      const samples = [0, 1, 4, 5, 30, 60, 300, 600, 1800, 3600, 86400, 100000];
      for (const s of samples) {
        expect(nextDurationUp(s)).toBeGreaterThanOrEqual(s);
      }
    });
  });

  describe('nextDurationDown', () => {
    // `Down` uses `<=`, so a value sitting on a boundary shrinks by the
    // *current* tier's delta rather than the next one up.
    it('clamps at 0 and never returns a negative value', () => {
      expect(nextDurationDown(0)).toBe(0);
      // Tiny positive values that fall in the delta-0 tier also stay put.
      expect(nextDurationDown(1)).toBe(1);
    });

    it('uses the current-tier delta at a tier boundary (<= semantics)', () => {
      // 5 sits on the +1 tier boundary → shrinks by 1
      expect(nextDurationDown(5)).toBe(4);
      // 30 sits on the +5 tier boundary → shrinks by 5
      expect(nextDurationDown(30)).toBe(25);
      // 300 sits on the +30 tier boundary → shrinks by 30
      expect(nextDurationDown(300)).toBe(270);
      // 600 sits on the +60 tier boundary → shrinks by 60
      expect(nextDurationDown(600)).toBe(540);
      // 86400 sits on the +3600 tier boundary → shrinks by 3600
      expect(nextDurationDown(86400)).toBe(82800);
    });

    it('uses the current tier delta when below the boundary', () => {
      // 4 is in the +1 tier
      expect(nextDurationDown(4)).toBe(3);
      // 60 is in the +15 tier
      expect(nextDurationDown(60)).toBe(45);
      // 1800 is in the +300 tier (current <= 1800)
      expect(nextDurationDown(1800)).toBe(1500);
      // 3600 is in the +600 tier (current <= 3600)
      expect(nextDurationDown(3600)).toBe(3000);
    });

    it('falls through to the catch-all tier for very large values', () => {
      expect(nextDurationDown(100000)).toBe(92800);
    });

    it('never returns a negative value', () => {
      const samples = [0, 1, 4, 5, 30, 60, 300, 600, 1800, 3600, 86400, 100000];
      for (const s of samples) {
        expect(nextDurationDown(s)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('up/down interplay', () => {
    // `up` uses `<` while `down` uses `<=`, so at boundaries
    // `down(up(x))` lands one tier higher than where we started: the round-trip
    // ends up *above* x rather than equal to it. Below boundaries, it returns
    // to x exactly. Both directions are documented here so future changes to
    // the breakpoint table are caught.
    it('round-trips exactly when starting strictly inside a tier', () => {
      // 4 is strictly inside the +1 tier on both sides.
      expect(nextDurationDown(nextDurationUp(4))).toBe(4);
      // 60 is strictly inside the +15 tier on both sides.
      expect(nextDurationDown(nextDurationUp(60))).toBe(60);
    });

    it('round-trips at tier boundaries', () => {
      // At a boundary, up uses < (jumps to next tier's delta) and down uses
      // <= (uses current tier's delta). These match for boundary values: 5
      // sits at the +1/+5 boundary; up(5) crosses into +5 land (delta 5),
      // and down(10) reads 10 as still inside +5 land (delta 5).
      expect(nextDurationUp(5)).toBe(10);
      expect(nextDurationDown(10)).toBe(5);
      expect(nextDurationDown(nextDurationUp(5))).toBe(5);
    });

    it('down/up are monotonic relative to current', () => {
      const samples = [0, 1, 4, 5, 30, 60, 300, 600, 1800, 3600, 86400];
      for (const s of samples) {
        expect(nextDurationDown(s)).toBeLessThanOrEqual(s);
        expect(nextDurationUp(s)).toBeGreaterThanOrEqual(s);
      }
    });
  });
});
