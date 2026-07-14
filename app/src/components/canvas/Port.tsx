// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PortDef, BusType } from '../../types';
import { WireDragState } from '../../hooks/useWireDrag';
import styles from './Port.module.css';

const BUS_CLASS: Record<BusType, string> = {
  I2C: styles.busI2c,
  SPI: styles.busSpi,
  UART: styles.busUart,
  GPIO: styles.busGpio,
  NEOPIXEL: styles.busNeopixel,
  MODBUS: styles.busModbus,
  ADC: styles.busAdc,
};

interface PortProps {
  port: PortDef;
  moduleId: string;
  canvasPos: { x: number; y: number };
  isOccupied: boolean;
  isCompatibleTarget: boolean;
  dragState: WireDragState;
  onStartDrag: (
    moduleId: string,
    portId: string,
    pos: { x: number; y: number },
    rightSide: boolean
  ) => void;
}

export default function Port({
  port,
  moduleId,
  canvasPos,
  isOccupied,
  isCompatibleTarget,
  dragState,
  onStartDrag,
}: PortProps) {
  const isRightSide = port.rightSide ?? false;

  const isSource =
    dragState.active && dragState.sourceModuleId === moduleId && dragState.sourcePortId === port.id;

  function getDotClass(): string {
    const base = [styles.dot, BUS_CLASS[port.busType]];
    base.push(isRightSide ? styles.dotRight : styles.dotLeft);

    if (isSource) {
      base.push(styles.dotSource);
    } else if (dragState.active) {
      base.push(isCompatibleTarget ? styles.dotCompatible : styles.dotIncompatible);
    } else if (isOccupied && !port.multiDrop) {
      base.push(styles.dotOccupied);
    }
    return base.join(' ');
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState.active) {
      onStartDrag(moduleId, port.id, canvasPos, isRightSide);
    }
  }

  const busLabel = port.busType === 'NEOPIXEL' ? 'NeoPixel' : port.busType;
  const title = `${port.label} (${busLabel}${port.multiDrop ? ', multi-drop' : ''}${isOccupied && !port.multiDrop ? ', occupied' : ''})`;

  return (
    <div className={`${styles.portRow} ${isRightSide ? styles.portRowRight : ''}`}>
      <div
        className={getDotClass()}
        data-module-id={moduleId}
        data-port-id={port.id}
        title={title}
        onPointerDown={handlePointerDown}
      />
      <span className={styles.portLabel}>{port.label}</span>
    </div>
  );
}
