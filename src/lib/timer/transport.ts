// Timer contracts. Three independent axes so new timers and new platforms are
// each a one-file change:
//
//   TimerDriver   — a specific timer model's BLE UUIDs + byte protocol.
//                   Add the Garmin Xero etc. by writing one driver. (M5)
//   BleBackend    — how BLE bytes move: Web Bluetooth (desktop) or native
//                   Capacitor (iOS). Add a platform by writing one backend. (A4)
//   TimerTransport— what the app depends on. BleTimerConnection implements it
//                   generically from any driver × any backend; the scan/connect/
//                   decode/auto-pull orchestration lives there, exactly once.
//
// A non-BLE timer (e.g. a future mic-based one) can implement TimerTransport
// directly without touching the BLE layers.

import type { ShotData, TimerEvent } from "./amgProtocol";
export type { ShotData, TimerEvent } from "./amgProtocol";

export type BleConnectionState = "disconnected" | "scanning" | "connecting" | "connected";

export type ShotDataListener = (data: ShotData) => void;
export type StateChangeListener = (state: BleConnectionState) => void;
export type TimerEventListener = (event: TimerEvent) => void;

/** What the app consumes. Transport-agnostic. */
export interface TimerTransport {
  readonly state: BleConnectionState;
  readonly deviceName: string | null;
  readonly isConnected: boolean;
  isSupported(): boolean;
  scanAndConnect(): Promise<boolean>; // false = user cancelled selection
  disconnect(): Promise<void>;
  startTimer(): Promise<void>;
  requestShotData(): Promise<void>;
  onShotData(fn: ShotDataListener): () => void;
  onStateChange(fn: StateChangeListener): () => void;
  onTimerEvent(fn: TimerEventListener): () => void;
}

// ── device drivers ──

/** One decoded event from a raw notification. */
export type TimerReading =
  | { type: "shot"; shot: ShotData }
  | { type: "timerEvent"; event: TimerEvent };

/** Per-connection decoder. Stateful (a timer may accumulate multi-packet shot
 *  strings); a fresh one is created per connection and reset before a re-pull. */
export interface TimerDecoder {
  decode(bytes: Uint8Array): TimerReading[];
  reset(): void;
}

/** Everything device-specific about one timer model. Adding a timer = adding
 *  one of these to the registry; no transport or backend changes. */
export interface TimerDriver {
  id: string; // stable key, e.g. "amg"
  name: string; // display name
  service: string; // BLE service UUID to scan/connect
  txChar: string; // notifications (timer -> app)
  rxChar: string; // commands (app -> timer)
  startCommand(): Uint8Array;
  requestShotDataCommand(): Uint8Array | null; // null if the timer auto-pushes
  autoRequestOnStop: boolean; // pull the string after a "stopped" event?
  createDecoder(): TimerDecoder;
}

// ── BLE backends (platform plumbing) ──

export interface BleConnectionHandle {
  readonly connected: boolean;
  subscribe(service: string, char: string, onData: (bytes: Uint8Array) => void): Promise<void>;
  write(service: string, char: string, bytes: Uint8Array): Promise<void>;
  disconnect(): Promise<void>;
}

export interface BleDeviceHandle {
  readonly name: string | null;
  connect(): Promise<BleConnectionHandle>;
  onDisconnect(cb: () => void): void;
}

/** Raw BLE, per platform. Web Bluetooth today; Capacitor native at A4. */
export interface BleBackend {
  isSupported(): boolean;
  /** Prompt the user to pick a device advertising `service`. null = cancelled. */
  requestDevice(service: string): Promise<BleDeviceHandle | null>;
}
