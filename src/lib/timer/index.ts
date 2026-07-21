// Timer entry point: picks the transport for the current platform and exposes a
// single `timer` the app uses everywhere. The web app and desktop dev use Web
// Bluetooth; the native iOS build (Capacitor) will select the CapacitorBle
// transport here (A4) — no call site changes when it lands.

import { getMetaValue } from "../store";
import type { TimerTransport } from "./transport";
import { WebBluetoothTimer } from "./webBluetooth";

function createTimer(): TimerTransport {
  // A4 will add:
  //   if (Capacitor.isNativePlatform()) return new CapacitorBleTimer();
  // The native transport implements the same TimerTransport interface and
  // decodes through the same ./amgProtocol, so nothing downstream changes.
  return new WebBluetoothTimer();
}

/** The app-wide timer singleton. */
export const timer: TimerTransport = createTimer();

/** Last successfully paired device name, for the reconnect hint. */
export function getLastPairedDevice(): string | null {
  return getMetaValue<string | null>("ble_last_device", null) || null;
}

export type { TimerTransport, BleConnectionState } from "./transport";
export type { ShotData, TimerEvent } from "./amgProtocol";
