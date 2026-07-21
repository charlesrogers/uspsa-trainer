/// <reference types="web-bluetooth" />
// Web Bluetooth transport — desktop Chrome dev and the web build. On iOS this
// is unsupported (Apple blocks Web Bluetooth); the Capacitor BLE transport
// takes over there. All byte decoding goes through ./amgProtocol.

import { setMetaValue } from "../store";
import {
  NUS_SERVICE_UUID, NUS_RX_CHAR_UUID, NUS_TX_CHAR_UUID,
  decodeFrame, sequenceToShotData, bytesToHex,
} from "./amgProtocol";
import type {
  TimerTransport, BleConnectionState,
  ShotDataListener, StateChangeListener, TimerEventListener,
} from "./transport";

export class WebBluetoothTimer implements TimerTransport {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private rxChar: BluetoothRemoteGATTCharacteristic | null = null;
  private txChar: BluetoothRemoteGATTCharacteristic | null = null;
  private _state: BleConnectionState = "disconnected";
  private _deviceName: string | null = null;
  private shotListeners: ShotDataListener[] = [];
  private stateListeners: StateChangeListener[] = [];
  private timerEventListeners: TimerEventListener[] = [];
  private shotSequence: number[] = [];

  get state() { return this._state; }
  get deviceName() { return this._deviceName; }
  get isConnected() { return this._state === "connected"; }

  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  onShotData(fn: ShotDataListener) {
    this.shotListeners.push(fn);
    return () => { this.shotListeners = this.shotListeners.filter((l) => l !== fn); };
  }
  onStateChange(fn: StateChangeListener) {
    this.stateListeners.push(fn);
    return () => { this.stateListeners = this.stateListeners.filter((l) => l !== fn); };
  }
  onTimerEvent(fn: TimerEventListener) {
    this.timerEventListeners.push(fn);
    return () => { this.timerEventListeners = this.timerEventListeners.filter((l) => l !== fn); };
  }

  private setState(state: BleConnectionState) {
    this._state = state;
    this.stateListeners.forEach((fn) => fn(state));
  }

  private async scan(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error("Web Bluetooth is not supported in this browser. Use Chrome on Android or desktop.");
    }
    this.setState("scanning");
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [NUS_SERVICE_UUID] }],
        optionalServices: [NUS_SERVICE_UUID],
      });
      this._deviceName = this.device.name || "AMG Timer";
      this.device.addEventListener("gattserverdisconnected", this.handleDisconnect);
      return true;
    } catch (err: unknown) {
      this.setState("disconnected");
      if (err instanceof Error && err.name === "NotFoundError") return false;
      throw err;
    }
  }

  private async connect(): Promise<void> {
    if (!this.device) throw new Error("No device selected. Call scan() first.");
    this.setState("connecting");
    try {
      this.server = await this.device.gatt!.connect();
      const service = await this.server.getPrimaryService(NUS_SERVICE_UUID);
      this.rxChar = await service.getCharacteristic(NUS_RX_CHAR_UUID);
      this.txChar = await service.getCharacteristic(NUS_TX_CHAR_UUID);
      await this.txChar.startNotifications();
      this.txChar.addEventListener("characteristicvaluechanged", this.handleNotification);
      this.setState("connected");
      setMetaValue("ble_last_device", this._deviceName || "");
    } catch (err) {
      this.setState("disconnected");
      throw err;
    }
  }

  async scanAndConnect(): Promise<boolean> {
    const found = await this.scan();
    if (!found) return false;
    await this.connect();
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.txChar) {
      try {
        this.txChar.removeEventListener("characteristicvaluechanged", this.handleNotification);
        await this.txChar.stopNotifications();
      } catch { /* ignore */ }
    }
    if (this.server?.connected) this.server.disconnect();
    this.cleanup();
  }

  async startTimer(): Promise<void> {
    if (!this.rxChar) throw new Error("Not connected to timer");
    await this.rxChar.writeValue(new TextEncoder().encode("COM START"));
  }

  async requestShotData(): Promise<void> {
    if (!this.rxChar) throw new Error("Not connected to timer");
    this.shotSequence = [];
    await this.rxChar.writeValue(new TextEncoder().encode("REQ STRING HEX"));
  }

  private handleNotification = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;
    const bytes = new Uint8Array(value.buffer);
    this.dispatch(bytes);
  };

  /** Decode one frame (pure) and drive the transport's small amount of state. */
  private dispatch(bytes: Uint8Array) {
    const frame = decodeFrame(bytes);
    switch (frame.kind) {
      case "shot":
        this.shotListeners.forEach((fn) => fn(frame.shot));
        return;
      case "timerEvent":
        this.timerEventListeners.forEach((fn) => fn(frame.event));
        // The timer doesn't push the full string on stop — pull it.
        if (frame.event === "stopped") {
          setTimeout(() => this.requestShotData().catch((e) => console.error("[timer]", e)), 200);
        }
        return;
      case "sequenceBatch": {
        if (frame.isFirst) this.shotSequence = [];
        this.shotSequence.push(...frame.times);
        const shot = sequenceToShotData(this.shotSequence, bytesToHex(bytes));
        if (shot) this.shotListeners.forEach((fn) => fn(shot));
        return;
      }
      case "unknown":
        return;
    }
  }

  private handleDisconnect = () => this.cleanup();

  private cleanup() {
    this.rxChar = null;
    this.txChar = null;
    this.server = null;
    this.shotSequence = [];
    this.setState("disconnected");
  }
}
