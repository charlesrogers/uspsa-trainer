// The BLE connection orchestration, tested headless with a fake backend + the
// real AMG driver. This is what used to be untestable Web Bluetooth glue — now
// the scan/connect/decode/emit/auto-pull logic is proven without a device.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv } from "./harness";
import { BleTimerConnection } from "../timer/bleConnection";
import { amgDriver } from "../timer/drivers/amg";
import type { BleBackend, BleDeviceHandle, BleConnectionHandle, ShotData, TimerEvent } from "../timer/transport";

// A fake BLE backend that records writes and lets the test push notification
// bytes as if the timer sent them.
class FakeBackend implements BleBackend {
  writes: { char: string; bytes: Uint8Array }[] = [];
  private notify: ((bytes: Uint8Array) => void) | null = null;
  cancelled = false;
  disconnectCb: (() => void) | null = null;

  isSupported() { return true; }

  async requestDevice(): Promise<BleDeviceHandle | null> {
    if (this.cancelled) return null;
    const conn: BleConnectionHandle = {
      connected: true,
      subscribe: async (_s, _c, onData) => { this.notify = onData; },
      write: async (_s, char, bytes) => { this.writes.push({ char, bytes }); },
      disconnect: async () => {},
    };
    return {
      name: "AMG Timer",
      connect: async () => conn,
      onDisconnect: (cb) => { this.disconnectCb = cb; },
    };
  }

  /** Simulate a notification frame from the timer. */
  push(...bytes: number[]) {
    this.notify?.(new Uint8Array(bytes));
  }
}

let backend: FakeBackend;
let conn: BleTimerConnection;
let shots: ShotData[];
let events: TimerEvent[];

beforeEach(() => {
  installBrowserEnv();
  vi.useFakeTimers();
  backend = new FakeBackend();
  conn = new BleTimerConnection(amgDriver, backend);
  shots = [];
  events = [];
  conn.onShotData((s) => shots.push(s));
  conn.onTimerEvent((e) => events.push(e));
});

afterEach(() => {
  vi.useRealTimers();
  uninstallBrowserEnv();
});

describe("connect lifecycle", () => {
  it("goes connected on success and reports the device name", async () => {
    const ok = await conn.scanAndConnect();
    expect(ok).toBe(true);
    expect(conn.state).toBe("connected");
    expect(conn.isConnected).toBe(true);
    expect(conn.deviceName).toBe("AMG Timer");
  });

  it("returns false and stays disconnected when the user cancels", async () => {
    backend.cancelled = true;
    expect(await conn.scanAndConnect()).toBe(false);
    expect(conn.state).toBe("disconnected");
  });

  it("cleans up when the device drops", async () => {
    await conn.scanAndConnect();
    backend.disconnectCb!();
    expect(conn.state).toBe("disconnected");
  });
});

describe("commands use the driver's protocol", () => {
  it("startTimer writes the AMG start command to the rx characteristic", async () => {
    await conn.scanAndConnect();
    await conn.startTimer();
    const w = backend.writes.at(-1)!;
    expect(w.char).toBe(amgDriver.rxChar);
    expect(new TextDecoder().decode(w.bytes)).toBe("COM START");
  });
});

describe("decoding + emit", () => {
  it("emits a shot from a real-time push frame", async () => {
    await conn.scanAndConnect();
    backend.push(1, 3, 0, 0, 0, 100, 0, 50, 0, 100); // total 1.00, split 0.50, first 1.00
    expect(shots).toHaveLength(1);
    expect(shots[0].totalTime).toBeCloseTo(1.0, 5);
    expect(shots[0].splits).toEqual([0.5]);
  });

  it("emits started/stopped and auto-pulls the string after stop", async () => {
    await conn.scanAndConnect();
    backend.push(1, 5); // started
    backend.push(1, 8); // stopped
    expect(events).toEqual(["started", "stopped"]);

    // The auto-pull is deferred; it fires the REQ STRING HEX write.
    expect(backend.writes.some((w) => new TextDecoder().decode(w.bytes) === "REQ STRING HEX")).toBe(false);
    await vi.advanceTimersByTimeAsync(250);
    expect(backend.writes.some((w) => new TextDecoder().decode(w.bytes) === "REQ STRING HEX")).toBe(true);
  });

  it("accumulates a multi-batch shot sequence into total + splits", async () => {
    await conn.scanAndConnect();
    // batch 10 (first), 2 values: (0,100)=1.00, (1,44)=3.00
    backend.push(10, 2, 0, 100, 1, 44);
    // batch 11, 1 value: (3,232)=10.00
    backend.push(11, 1, 3, 232);
    const last = shots.at(-1)!;
    expect(last.firstShotTime).toBeCloseTo(1.0, 5);
    expect(last.totalTime).toBeCloseTo(10.0, 5);
    expect(last.splits).toEqual([2.0, 7.0]); // 3-1, 10-3
    expect(last.shotCount).toBe(3);
  });
});
