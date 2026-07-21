/// <reference types="web-bluetooth" />
// Web Bluetooth backend — desktop Chrome and the web build. iOS Safari blocks
// Web Bluetooth, so the Capacitor native backend (A4) takes over there. This is
// pure BLE plumbing: it knows nothing about any specific timer's protocol.

import type { BleBackend, BleDeviceHandle, BleConnectionHandle } from "./transport";

class WebBleConnection implements BleConnectionHandle {
  constructor(private server: BluetoothRemoteGATTServer) {}

  get connected() {
    return this.server.connected;
  }

  async subscribe(service: string, char: string, onData: (bytes: Uint8Array) => void): Promise<void> {
    const svc = await this.server.getPrimaryService(service);
    const ch = await svc.getCharacteristic(char);
    await ch.startNotifications();
    ch.addEventListener("characteristicvaluechanged", (event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) onData(new Uint8Array(value.buffer));
    });
  }

  async write(service: string, char: string, bytes: Uint8Array): Promise<void> {
    const svc = await this.server.getPrimaryService(service);
    const ch = await svc.getCharacteristic(char);
    // Copy into a fresh ArrayBuffer-backed view — writeValue's BufferSource
    // type rejects the generic ArrayBufferLike backing.
    await ch.writeValue(new Uint8Array(bytes));
  }

  async disconnect(): Promise<void> {
    if (this.server.connected) this.server.disconnect();
  }
}

class WebBleDevice implements BleDeviceHandle {
  constructor(private device: BluetoothDevice) {}
  get name() {
    return this.device.name ?? null;
  }
  async connect(): Promise<BleConnectionHandle> {
    const server = await this.device.gatt!.connect();
    return new WebBleConnection(server);
  }
  onDisconnect(cb: () => void): void {
    this.device.addEventListener("gattserverdisconnected", cb);
  }
}

export class WebBluetoothBackend implements BleBackend {
  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async requestDevice(service: string): Promise<BleDeviceHandle | null> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [service] }],
        optionalServices: [service],
      });
      return new WebBleDevice(device);
    } catch (err) {
      // The user dismissing the chooser surfaces as NotFoundError.
      if (err instanceof Error && err.name === "NotFoundError") return null;
      throw err;
    }
  }
}
