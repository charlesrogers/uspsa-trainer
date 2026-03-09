/// <reference types="web-bluetooth" />
// AMG Lab Commander BLE integration via Web Bluetooth API
// Uses Nordic UART Service (NUS) for communication
// Protocol reverse-engineered from https://github.com/DenisZhadan/AmgLabCommander

const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Write to timer
const NUS_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Notifications from timer

export type BleConnectionState = "disconnected" | "scanning" | "connecting" | "connected";

export interface ShotData {
  totalTime: number;
  firstShotTime: number | null;
  splits: number[];
  shotCount: number;
  rawBytes: string; // hex dump for debugging
}

export type TimerEvent = "started" | "stopped";
type ShotDataListener = (data: ShotData) => void;
type StateChangeListener = (state: BleConnectionState) => void;
type TimerEventListener = (event: TimerEvent) => void;

// Convert 2-byte time value to seconds
// Java reference uses signed bytes: int value = 256 * b1 + b2; if (b2 <= 0) value += 256; return value / 100.0
// JS Uint8Array gives unsigned (0-255), must convert to signed (-128..127) to match Java
function convertTime(b1: number, b2: number): number {
  const s1 = b1 > 127 ? b1 - 256 : b1;
  const s2 = b2 > 127 ? b2 - 256 : b2;
  let value = 256 * s1 + s2;
  if (s2 <= 0) {
    value += 256;
  }
  return value / 100.0;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(" ");
}

class LabCommanderBLE {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private rxChar: BluetoothRemoteGATTCharacteristic | null = null;
  private txChar: BluetoothRemoteGATTCharacteristic | null = null;
  private _state: BleConnectionState = "disconnected";
  private _deviceName: string | null = null;
  private shotListeners: ShotDataListener[] = [];
  private stateListeners: StateChangeListener[] = [];
  private timerEventListeners: TimerEventListener[] = [];

  // Shot sequence accumulator for multi-packet REQ STRING HEX responses
  private shotSequence: number[] = [];

  get state() { return this._state; }
  get deviceName() { return this._deviceName; }
  get isConnected() { return this._state === "connected"; }

  private setState(state: BleConnectionState) {
    this._state = state;
    this.stateListeners.forEach(fn => fn(state));
  }

  onShotData(fn: ShotDataListener) {
    this.shotListeners.push(fn);
    return () => { this.shotListeners = this.shotListeners.filter(l => l !== fn); };
  }

  onStateChange(fn: StateChangeListener) {
    this.stateListeners.push(fn);
    return () => { this.stateListeners = this.stateListeners.filter(l => l !== fn); };
  }

  onTimerEvent(fn: TimerEventListener) {
    this.timerEventListeners.push(fn);
    return () => { this.timerEventListeners = this.timerEventListeners.filter(l => l !== fn); };
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async scan(): Promise<boolean> {
    if (!LabCommanderBLE.isSupported()) {
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
      if (err instanceof Error && err.name === "NotFoundError") {
        return false;
      }
      throw err;
    }
  }

  async connect(): Promise<void> {
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
      localStorage.setItem("ble_last_device", this._deviceName || "");
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
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.cleanup();
  }

  async startTimer(): Promise<void> {
    if (!this.rxChar) throw new Error("Not connected to timer");
    const encoder = new TextEncoder();
    await this.rxChar.writeValue(encoder.encode("COM START"));
  }

  async requestShotData(): Promise<void> {
    if (!this.rxChar) throw new Error("Not connected to timer");
    this.shotSequence = []; // clear accumulator before request
    const encoder = new TextEncoder();
    await this.rxChar.writeValue(encoder.encode("REQ STRING HEX"));
  }

  private handleNotification = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const bytes = new Uint8Array(value.buffer);
    console.log("[BLE] Raw bytes:", bytesToHex(bytes), "length:", bytes.length);

    if (bytes.length < 2) return;

    const b0 = bytes[0];
    const b1 = bytes[1];

    // ── BLE Push: real-time per-shot notification ──
    // bytes[0] == 1, bytes[1] == 3
    // bytes[4..5] = current time, bytes[6..7] = split, bytes[8..9] = first shot
    if (b0 === 1 && b1 === 3 && bytes.length >= 10) {
      const time = convertTime(bytes[4], bytes[5]);
      const split = convertTime(bytes[6], bytes[7]);
      const first = convertTime(bytes[8], bytes[9]);

      console.log("[BLE] Push shot - time:", time, "split:", split, "first:", first);

      const shotData: ShotData = {
        totalTime: parseFloat(time.toFixed(2)),
        firstShotTime: parseFloat(first.toFixed(2)),
        splits: split > 0 ? [parseFloat(split.toFixed(2))] : [],
        shotCount: 1,
        rawBytes: bytesToHex(bytes),
      };
      this.shotListeners.forEach(fn => fn(shotData));
      return;
    }

    // ── Timer state notifications ──
    if (b0 === 1 && b1 === 5) {
      console.log("[BLE] Timer started");
      this.timerEventListeners.forEach(fn => fn("started"));
      return;
    }
    if (b0 === 1 && b1 === 8) {
      console.log("[BLE] Timer stopped — auto-pulling shot data");
      this.timerEventListeners.forEach(fn => fn("stopped"));
      // Auto-pull shot data when timer stops
      setTimeout(() => this.requestShotData().catch(console.error), 200);
      return;
    }

    // ── REQ STRING HEX response: shot sequence data ──
    // bytes[0] = 10..26 (batch number, 10 = first batch)
    // bytes[1] = count of time values in this packet
    // bytes[2..3], bytes[4..5], ... = time values (2 bytes each)
    if (b0 >= 10 && b0 <= 26) {
      const count = b1;
      if (b0 === 10) {
        this.shotSequence = []; // first batch, clear
      }

      for (let i = 0; i < count; i++) {
        const offset = 2 + i * 2;
        if (offset + 1 < bytes.length) {
          const t = convertTime(bytes[offset], bytes[offset + 1]);
          this.shotSequence.push(parseFloat(t.toFixed(2)));
        }
      }

      console.log("[BLE] Shot sequence batch", b0, "count:", count, "accumulated:", this.shotSequence);

      // Emit the full sequence after each batch
      // Shot sequence contains CUMULATIVE times (e.g., [2.36, 2.74] = first at 2.36, total at 2.74)
      // Total = last entry, splits = differences between consecutive entries
      if (this.shotSequence.length > 0) {
        const first = this.shotSequence[0];
        const total = this.shotSequence[this.shotSequence.length - 1];
        const splits: number[] = [];
        for (let i = 1; i < this.shotSequence.length; i++) {
          splits.push(parseFloat((this.shotSequence[i] - this.shotSequence[i - 1]).toFixed(2)));
        }

        console.log("[BLE] Sequence:", this.shotSequence, "→ total:", total, "first:", first, "splits:", splits);

        const shotData: ShotData = {
          totalTime: parseFloat(total.toFixed(2)),
          firstShotTime: first,
          splits,
          shotCount: this.shotSequence.length,
          rawBytes: bytesToHex(bytes),
        };
        this.shotListeners.forEach(fn => fn(shotData));
      }
      return;
    }

    console.log("[BLE] Unknown message type, b0:", b0, "b1:", b1);
  };

  private handleDisconnect = () => {
    this.cleanup();
  };

  private cleanup() {
    this.rxChar = null;
    this.txChar = null;
    this.server = null;
    this.shotSequence = [];
    this.setState("disconnected");
  }
}

// Singleton instance
export const timer = new LabCommanderBLE();

// Convenience hook helpers
export function getLastPairedDevice(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ble_last_device") || null;
}
