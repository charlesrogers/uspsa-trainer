// AMG Lab Commander driver. All AMG-specific knowledge lives here: the Nordic
// UART UUIDs, the "COM START" / "REQ STRING HEX" commands, and a stateful
// decoder that accumulates the multi-packet shot string. Everything it does
// with bytes goes through the pure ../amgProtocol.

import {
  NUS_SERVICE_UUID, NUS_RX_CHAR_UUID, NUS_TX_CHAR_UUID,
  decodeFrame, sequenceToShotData, bytesToHex,
} from "../amgProtocol";
import type { TimerDriver, TimerDecoder, TimerReading } from "../transport";

const enc = new TextEncoder();

class AmgDecoder implements TimerDecoder {
  private sequence: number[] = [];

  reset() {
    this.sequence = [];
  }

  decode(bytes: Uint8Array): TimerReading[] {
    const frame = decodeFrame(bytes);
    switch (frame.kind) {
      case "shot":
        return [{ type: "shot", shot: frame.shot }];
      case "timerEvent":
        return [{ type: "timerEvent", event: frame.event }];
      case "sequenceBatch": {
        if (frame.isFirst) this.sequence = [];
        this.sequence.push(...frame.times);
        const shot = sequenceToShotData(this.sequence, bytesToHex(bytes));
        return shot ? [{ type: "shot", shot }] : [];
      }
      case "unknown":
        return [];
    }
  }
}

export const amgDriver: TimerDriver = {
  id: "amg",
  name: "AMG Lab Commander",
  service: NUS_SERVICE_UUID,
  txChar: NUS_TX_CHAR_UUID,
  rxChar: NUS_RX_CHAR_UUID,
  startCommand: () => enc.encode("COM START"),
  requestShotDataCommand: () => enc.encode("REQ STRING HEX"),
  autoRequestOnStop: true,
  createDecoder: () => new AmgDecoder(),
};
