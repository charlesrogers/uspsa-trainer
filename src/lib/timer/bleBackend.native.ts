// Native BLE backend (iOS via Capacitor). Implements the same BleBackend as the
// Web Bluetooth one, so the connection orchestration and every timer driver work
// unchanged — this is the only iOS-specific timer code in the app. Uses
// @capacitor-community/bluetooth-le (CoreBluetooth under the hood).

import { BleClient, type BleDevice } from "@capacitor-community/bluetooth-le";
import type { BleBackend, BleDeviceHandle, BleConnectionHandle } from "./transport";

function toDataView(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

class NativeBleConnection implements BleConnectionHandle {
  private _connected = true;
  constructor(private deviceId: string) {}

  get connected() {
    return this._connected;
  }

  async subscribe(service: string, char: string, onData: (bytes: Uint8Array) => void): Promise<void> {
    await BleClient.startNotifications(this.deviceId, service, char, (value) => {
      onData(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
    });
  }

  async write(service: string, char: string, bytes: Uint8Array): Promise<void> {
    await BleClient.write(this.deviceId, service, char, toDataView(bytes));
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    try {
      await BleClient.disconnect(this.deviceId);
    } catch {
      /* already gone */
    }
  }
}

class NativeBleDevice implements BleDeviceHandle {
  private onDisc: (() => void) | null = null;

  constructor(private device: BleDevice) {}

  get name() {
    return this.device.name ?? null;
  }

  async connect(): Promise<BleConnectionHandle> {
    await BleClient.connect(this.device.deviceId, () => this.onDisc?.());
    return new NativeBleConnection(this.device.deviceId);
  }

  onDisconnect(cb: () => void): void {
    this.onDisc = cb;
  }
}

export class CapacitorBleBackend implements BleBackend {
  isSupported(): boolean {
    return true; // only selected on a native platform
  }

  async requestDevice(service: string): Promise<BleDeviceHandle | null> {
    await BleClient.initialize({ androidNeverForLocation: true });
    try {
      const device = await BleClient.requestDevice({ services: [service] });
      return new NativeBleDevice(device);
    } catch {
      // The user dismissing the native picker rejects — treat as cancelled.
      return null;
    }
  }
}
