// Characterization tests for the AMG Lab Commander byte->seconds decoder.
//
// These PIN CURRENT BEHAVIOR. The decoder ports a Java reference that used
// signed bytes, so several cases (b2 == 0, b2 >= 128) go through the
// `if (s2 <= 0) value += 256` branch and produce results that look surprising
// in isolation. They are recorded here exactly as the shipped code computes
// them. Do not "correct" these numbers without a real timer to verify against.

import { describe, it, expect } from "vitest";
import { convertTime, decodeFrame, sequenceToShotData } from "../timer/amgProtocol";

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

describe("decodeFrame", () => {
  const bytes = (...b: number[]) => new Uint8Array(b);

  it("classifies a too-short frame as unknown", () => {
    expect(decodeFrame(bytes(1)).kind).toBe("unknown");
  });

  it("decodes a real-time push shot [1,3,...]", () => {
    // time @ [4,5], split @ [6,7], first @ [8,9]. Use 0,100 -> 1.00s etc.
    const frame = decodeFrame(bytes(1, 3, 0, 0, 0, 100, 0, 50, 0, 100));
    expect(frame.kind).toBe("shot");
    if (frame.kind !== "shot") throw new Error("unreachable");
    expect(frame.shot.totalTime).toBeCloseTo(1.0, 5);
    expect(frame.shot.splits).toEqual([0.5]);
    expect(frame.shot.firstShotTime).toBeCloseTo(1.0, 5);
    expect(frame.shot.shotCount).toBe(1);
  });

  it("omits a zero split from a push shot", () => {
    const frame = decodeFrame(bytes(1, 3, 0, 0, 0, 100, 0, 0, 0, 100));
    if (frame.kind !== "shot") throw new Error("expected shot");
    // split byte pair (0,0) decodes to 2.56 via the signed-byte branch, which is
    // > 0, so it IS included — this pins the real behavior, not an assumption.
    expect(frame.shot.splits).toEqual([2.56]);
  });

  it("decodes timer started / stopped", () => {
    expect(decodeFrame(bytes(1, 5)).kind).toBe("timerEvent");
    const started = decodeFrame(bytes(1, 5));
    const stopped = decodeFrame(bytes(1, 8));
    if (started.kind !== "timerEvent" || stopped.kind !== "timerEvent") throw new Error("expected events");
    expect(started.event).toBe("started");
    expect(stopped.event).toBe("stopped");
  });

  it("decodes a sequence batch and flags the first one", () => {
    // batch 10 (first), count 2, two cumulative times: (0,100)=1.00, (1,44)=3.00
    const frame = decodeFrame(bytes(10, 2, 0, 100, 1, 44));
    expect(frame.kind).toBe("sequenceBatch");
    if (frame.kind !== "sequenceBatch") throw new Error("unreachable");
    expect(frame.isFirst).toBe(true);
    expect(frame.batch).toBe(10);
    expect(frame.times).toEqual([1.0, 3.0]);

    const next = decodeFrame(bytes(11, 1, 3, 232)); // batch 11, (3,232)=10.00
    if (next.kind !== "sequenceBatch") throw new Error("expected batch");
    expect(next.isFirst).toBe(false);
  });

  it("treats an unrecognized header as unknown", () => {
    expect(decodeFrame(bytes(99, 99, 1, 2)).kind).toBe("unknown");
  });
});

describe("sequenceToShotData", () => {
  it("returns null for an empty sequence", () => {
    expect(sequenceToShotData([], "")).toBeNull();
  });

  it("turns cumulative times into total + first + splits", () => {
    // [first@2.36, @2.74] -> total 2.74, first 2.36, one split 0.38
    const shot = sequenceToShotData([2.36, 2.74], "de ad");
    expect(shot).not.toBeNull();
    expect(shot!.totalTime).toBeCloseTo(2.74, 5);
    expect(shot!.firstShotTime).toBeCloseTo(2.36, 5);
    expect(shot!.splits).toEqual([0.38]);
    expect(shot!.shotCount).toBe(2);
    expect(shot!.rawBytes).toBe("de ad");
  });

  it("handles a single-shot sequence (no splits)", () => {
    const shot = sequenceToShotData([1.25], "");
    expect(shot!.totalTime).toBeCloseTo(1.25, 5);
    expect(shot!.splits).toEqual([]);
  });
});
