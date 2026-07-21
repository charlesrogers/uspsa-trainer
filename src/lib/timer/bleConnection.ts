// Generic BLE timer connection: drives any TimerDriver over any BleBackend.
// The scan/connect/subscribe/decode/emit orchestration — including the
// auto-pull after a "stopped" event — lives here ONCE, so a new timer (driver)
// or a new platform (backend) never re-implements it. Testable headless by
// injecting a fake backend.

import { setMetaValue } from "../store";
import type {
  TimerTransport, TimerDriver, TimerDecoder, BleBackend, BleConnectionHandle,
  BleConnectionState, ShotDataListener, StateChangeListener, TimerEventListener,
} from "./transport";

const AUTO_PULL_DELAY_MS = 200;

export class BleTimerConnection implements TimerTransport {
  private conn: BleConnectionHandle | null = null;
  private decoder: TimerDecoder | null = null;
  private _state: BleConnectionState = "disconnected";
  private _deviceName: string | null = null;
  private shotListeners: ShotDataListener[] = [];
  private stateListeners: StateChangeListener[] = [];
  private timerEventListeners: TimerEventListener[] = [];

  constructor(private driver: TimerDriver, private backend: BleBackend) {}

  get state() { return this._state; }
  get deviceName() { return this._deviceName; }
  get isConnected() { return this._state === "connected"; }

  isSupported() { return this.backend.isSupported(); }

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

  async scanAndConnect(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error("Bluetooth is not available in this environment.");
    }
    this.setState("scanning");
    let device;
    try {
      device = await this.backend.requestDevice(this.driver.service);
    } catch (err) {
      this.setState("disconnected");
      throw err;
    }
    if (!device) {
      this.setState("disconnected");
      return false; // user cancelled selection
    }

    this._deviceName = device.name || this.driver.name;
    device.onDisconnect(() => this.cleanup());
    this.setState("connecting");
    try {
      this.conn = await device.connect();
      this.decoder = this.driver.createDecoder();
      await this.conn.subscribe(this.driver.service, this.driver.txChar, (bytes) => this.onData(bytes));
      this.setState("connected");
      setMetaValue("ble_last_device", this._deviceName || "");
      return true;
    } catch (err) {
      this.setState("disconnected");
      throw err;
    }
  }

  private onData(bytes: Uint8Array) {
    if (!this.decoder) return;
    for (const reading of this.decoder.decode(bytes)) {
      if (reading.type === "shot") {
        this.shotListeners.forEach((fn) => fn(reading.shot));
      } else {
        this.timerEventListeners.forEach((fn) => fn(reading.event));
        if (reading.event === "stopped" && this.driver.autoRequestOnStop) {
          setTimeout(() => this.requestShotData().catch((e) => console.error("[timer]", e)), AUTO_PULL_DELAY_MS);
        }
      }
    }
  }

  async startTimer(): Promise<void> {
    if (!this.conn) throw new Error("Not connected to timer");
    await this.conn.write(this.driver.service, this.driver.rxChar, this.driver.startCommand());
  }

  async requestShotData(): Promise<void> {
    if (!this.conn) throw new Error("Not connected to timer");
    const cmd = this.driver.requestShotDataCommand();
    if (!cmd) return; // this timer auto-pushes; nothing to request
    this.decoder?.reset();
    await this.conn.write(this.driver.service, this.driver.rxChar, cmd);
  }

  async disconnect(): Promise<void> {
    try {
      await this.conn?.disconnect();
    } catch { /* ignore */ }
    this.cleanup();
  }

  private cleanup() {
    this.conn = null;
    this.decoder = null;
    this.setState("disconnected");
  }
}
