// AMG Lab Commander wire protocol — PURE functions only, no I/O.
//
// This is the one place the timer's bytes are understood. Both the Web
// Bluetooth transport (desktop dev) and the native Capacitor BLE transport
// (iOS) decode through here, so the protocol has exactly one implementation and
// one test suite. Reverse-engineered from
// https://github.com/DenisZhadan/AmgLabCommander.

// Nordic UART Service — same on every transport.
export const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const NUS_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write to timer
export const NUS_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notifications from timer

export interface ShotData {
  totalTime: number;
  firstShotTime: number | null;
  splits: number[];
  shotCount: number;
  rawBytes: string; // hex dump for debugging
}

export type TimerEvent = "started" | "stopped";

const round2 = (n: number): number => parseFloat(n.toFixed(2));

// Convert a 2-byte time value to seconds.
// The Java reference uses SIGNED bytes: value = 256*b1 + b2; if (b2 <= 0) value
// += 256; return value/100. JS Uint8Array is unsigned (0-255), so we convert to
// signed (-128..127) to match. This is why some frames (b2 == 0, b2 >= 128) go
// through the +256 branch and decode to values that look surprising in isolation
// — the ble.test.ts vectors pin the exact behavior; do not "correct" them.
export function convertTime(b1: number, b2: number): number {
  const s1 = b1 > 127 ? b1 - 256 : b1;
  const s2 = b2 > 127 ? b2 - 256 : b2;
  let value = 256 * s1 + s2;
  if (s2 <= 0) {
    value += 256;
  }
  return value / 100.0;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

/** A single decoded notification frame. `sequenceBatch` carries one packet of a
 *  multi-packet REQ STRING HEX response; the transport accumulates batches and
 *  finishes with sequenceToShotData(). */
export type Frame =
  | { kind: "shot"; shot: ShotData }
  | { kind: "timerEvent"; event: TimerEvent }
  | { kind: "sequenceBatch"; batch: number; isFirst: boolean; times: number[] }
  | { kind: "unknown" };

/** Classify and decode one raw notification. Pure — no accumulation, no I/O. */
export function decodeFrame(bytes: Uint8Array): Frame {
  if (bytes.length < 2) return { kind: "unknown" };
  const b0 = bytes[0];
  const b1 = bytes[1];

  // Real-time per-shot push: [1,3, _,_, time, split, first, ...]
  if (b0 === 1 && b1 === 3 && bytes.length >= 10) {
    const time = convertTime(bytes[4], bytes[5]);
    const split = convertTime(bytes[6], bytes[7]);
    const first = convertTime(bytes[8], bytes[9]);
    return {
      kind: "shot",
      shot: {
        totalTime: round2(time),
        firstShotTime: round2(first),
        splits: split > 0 ? [round2(split)] : [],
        shotCount: 1,
        rawBytes: bytesToHex(bytes),
      },
    };
  }

  // Timer state.
  if (b0 === 1 && b1 === 5) return { kind: "timerEvent", event: "started" };
  if (b0 === 1 && b1 === 8) return { kind: "timerEvent", event: "stopped" };

  // REQ STRING HEX response batch: b0 = 10..26 (10 = first), b1 = value count,
  // then b1 cumulative time values, 2 bytes each starting at offset 2.
  if (b0 >= 10 && b0 <= 26) {
    const count = b1;
    const times: number[] = [];
    for (let i = 0; i < count; i++) {
      const offset = 2 + i * 2;
      if (offset + 1 < bytes.length) {
        times.push(round2(convertTime(bytes[offset], bytes[offset + 1])));
      }
    }
    return { kind: "sequenceBatch", batch: b0, isFirst: b0 === 10, times };
  }

  return { kind: "unknown" };
}

/** Convert an accumulated CUMULATIVE shot sequence (e.g. [2.36, 2.74]) into a
 *  ShotData: total = last, first = first, splits = consecutive differences. */
export function sequenceToShotData(cumulative: number[], rawBytes: string): ShotData | null {
  if (cumulative.length === 0) return null;
  const first = cumulative[0];
  const total = cumulative[cumulative.length - 1];
  const splits: number[] = [];
  for (let i = 1; i < cumulative.length; i++) {
    splits.push(round2(cumulative[i] - cumulative[i - 1]));
  }
  return {
    totalTime: round2(total),
    firstShotTime: first,
    splits,
    shotCount: cumulative.length,
    rawBytes,
  };
}
