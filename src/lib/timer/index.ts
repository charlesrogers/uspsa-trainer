// Timer entry point: the registry of supported timers, the platform BLE
// backend, and the app-wide `timer` singleton.
//
// Add a new timer (e.g. Garmin Xero — M5): write a driver under ./drivers/,
// add it to TIMER_DRIVERS. Nothing else changes.
// Add native iOS (A4): return a CapacitorBleBackend from selectBackend() when
// running natively. The connection orchestration is platform-agnostic.

import { getMetaValue } from "../store";
import type { TimerDriver, TimerTransport, BleBackend } from "./transport";
import { amgDriver } from "./drivers/amg";
import { WebBluetoothBackend } from "./bleBackend.web";
import { BleTimerConnection } from "./bleConnection";

/** Every timer the app can talk to. */
export const TIMER_DRIVERS: TimerDriver[] = [amgDriver];

/** The default until a per-user timer preference exists (M5 adds the picker). */
export const DEFAULT_DRIVER = amgDriver;

function selectBackend(): BleBackend {
  // A4: if (Capacitor.isNativePlatform()) return new CapacitorBleBackend();
  return new WebBluetoothBackend();
}

/** Build a transport for a specific timer. */
export function createTimer(driver: TimerDriver = DEFAULT_DRIVER): TimerTransport {
  return new BleTimerConnection(driver, selectBackend());
}

/** The app-wide timer singleton. */
export const timer: TimerTransport = createTimer();

/** Last successfully paired device name, for the reconnect hint. */
export function getLastPairedDevice(): string | null {
  return getMetaValue<string | null>("ble_last_device", null) || null;
}

export type { TimerTransport, TimerDriver, BleConnectionState } from "./transport";
export type { ShotData, TimerEvent } from "./amgProtocol";
