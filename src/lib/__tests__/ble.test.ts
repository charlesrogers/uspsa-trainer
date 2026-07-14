// Characterization tests for the AMG Lab Commander byte->seconds decoder.
//
// These PIN CURRENT BEHAVIOR. The decoder ports a Java reference that used
// signed bytes, so several cases (b2 == 0, b2 >= 128) go through the
// `if (s2 <= 0) value += 256` branch and produce results that look surprising
// in isolation. They are recorded here exactly as the shipped code computes
// them. Do not "correct" these numbers without a real timer to verify against.

import { describe, it, expect } from "vitest";
import { convertTime } from "../ble";

describe("convertTime", () => {
  it.each([
    // b1, b2, expected seconds
    [0, 1, 0.01],
    [0, 50, 0.5],
    [0, 100, 1.0],
    [0, 127, 1.27],
    [1, 44, 3.0],
    [3, 232, 10.0],
    [10, 0, 28.16],
  ])("decodes (%i, %i) -> %fs", (b1, b2, expected) => {
    expect(convertTime(b1, b2)).toBeCloseTo(expected, 5);
  });

  describe("signed-byte edge cases (the +256 branch)", () => {
    it("b2 = 0 takes the s2 <= 0 branch and adds a full 256", () => {
      // Naive reading would be 0.00s; the signed-byte port yields 2.56s.
      expect(convertTime(0, 0)).toBeCloseTo(2.56, 5);
      // Same branch with a high byte: 256*1 + 0 + 256 = 512.
      expect(convertTime(1, 0)).toBeCloseTo(5.12, 5);
    });

    it("b2 = 128 is read as -128, then corrected by +256", () => {
      expect(convertTime(0, 128)).toBeCloseTo(1.28, 5);
    });

    it("b2 = 255 is read as -1, then corrected by +256", () => {
      expect(convertTime(0, 255)).toBeCloseTo(2.55, 5);
    });

    it("b1 > 127 is treated as a negative high byte", () => {
      // s1 = -1 -> 256 * -1 + 100 = -156
      expect(convertTime(255, 100)).toBeCloseTo(-1.56, 5);
    });

    it("is continuous across the b2 = 127 -> 128 boundary", () => {
      expect(convertTime(0, 127)).toBeCloseTo(1.27, 5);
      expect(convertTime(0, 128)).toBeCloseTo(1.28, 5);
    });
  });
});
