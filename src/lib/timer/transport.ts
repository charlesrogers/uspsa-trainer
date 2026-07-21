// The timer transport boundary. Web Bluetooth (desktop dev) and Capacitor BLE
// (iOS) both implement this, so call sites — and useBle — never reference a
// specific Bluetooth API. Swapping transports touches no call site.

import type { ShotData, TimerEvent } from "./amgProtocol";

export type BleConnectionState = "disconnected" | "scanning" | "connecting" | "connected";

export type ShotDataListener = (data: ShotData) => void;
export type StateChangeListener = (state: BleConnectionState) => void;
export type TimerEventListener = (event: TimerEvent) => void;

export interface TimerTransport {
  readonly state: BleConnectionState;
  readonly deviceName: string | null;
  readonly isConnected: boolean;

  /** Whether this transport can run in the current environment. */
  isSupported(): boolean;

  /** Scan for the AMG, connect, and subscribe to notifications. Resolves false
   *  if the user cancelled device selection. */
  scanAndConnect(): Promise<boolean>;
  disconnect(): Promise<void>;

  startTimer(): Promise<void>;
  requestShotData(): Promise<void>;

  onShotData(fn: ShotDataListener): () => void;
  onStateChange(fn: StateChangeListener): () => void;
  onTimerEvent(fn: TimerEventListener): () => void;
}
