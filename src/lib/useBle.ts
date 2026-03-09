"use client";

import { useState, useEffect, useCallback } from "react";
import { timer, getLastPairedDevice } from "./ble";
import type { BleConnectionState, ShotData, TimerEvent } from "./ble";

export function useBle() {
  const [state, setState] = useState<BleConnectionState>("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [lastDevice, setLastDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const supported = typeof navigator !== "undefined" && "bluetooth" in navigator;
    setIsSupported(supported);
    setLastDevice(getLastPairedDevice());
    setState(timer.state);
    setDeviceName(timer.deviceName);

    const unsubState = timer.onStateChange((s) => {
      setState(s);
      setDeviceName(timer.deviceName);
    });

    const unsubTimer = timer.onTimerEvent((evt) => {
      if (evt === "started") setTimerRunning(true);
      if (evt === "stopped") setTimerRunning(false);
    });

    return () => { unsubState(); unsubTimer(); };
  }, []);

  const scanAndConnect = useCallback(async () => {
    setError(null);
    try {
      const ok = await timer.scanAndConnect();
      if (ok) setLastDevice(timer.deviceName);
      return ok;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);
    await timer.disconnect();
  }, []);

  const startTimer = useCallback(async () => {
    setError(null);
    try {
      await timer.startTimer();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start timer");
    }
  }, []);

  const requestShotData = useCallback(async () => {
    setError(null);
    try {
      await timer.requestShotData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request data");
    }
  }, []);

  return {
    state,
    deviceName,
    lastDevice,
    error,
    isSupported,
    isConnected: state === "connected",
    timerRunning,
    scanAndConnect,
    disconnect,
    startTimer,
    requestShotData,
  };
}

export function useShotData(onShot: (data: ShotData) => void) {
  useEffect(() => {
    const unsub = timer.onShotData(onShot);
    return unsub;
  }, [onShot]);
}
