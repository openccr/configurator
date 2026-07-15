// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

export type BusType = 'I2C' | 'SPI' | 'UART' | 'NEOPIXEL' | 'MODBUS' | 'GPIO' | 'ADC' | 'SOLENOID';
export type PortDirection = 'in' | 'out' | 'bidir';

export type ModuleType =
  | 'MCU'
  | 'CELL_READER_4_CG'
  | 'CELL_READER_4_DIFF'
  | 'CELL_READER_8_CG'
  | 'CELL_READER_8_DIFF'
  | 'O2_CELL_ANALOG'
  | 'O2_CELL_DIGITAL'
  | 'CO2_SENSOR'
  | 'CO_SENSOR'
  | 'HE_SENSOR'
  | 'PRESSURE_SENSOR'
  | 'BATT_VOLTAGE_SENSOR'
  | 'BATT_MANAGEMENT'
  | 'ROTARY_ENCODER'
  | 'CO2_TEMP_STICK'
  | 'WATER_CONTACT'
  | 'SOLENOID_DRIVER_1PORT'
  | 'SOLENOID_DRIVER_2PORT'
  | 'SOLENOID_DRIVER_4PORT'
  | 'SOLENOID_VALVE'
  | 'STATUS_LIGHT'
  | 'HUD_3LED'
  | 'HUD_6LED'
  | 'DECO_HUD'
  | 'BUZZER'
  | 'FLASH_MEMORY'
  | 'PPO2_DISPLAY'
  | 'BUTTONS'
  | 'GENERAL_SCREEN';

export interface PortDef {
  id: string;
  label: string;
  busType: BusType;
  direction: PortDirection;
  multiDrop: boolean;
  /** true = port dot is on the RIGHT edge of the card (default: false = left edge) */
  rightSide?: boolean;
  /**
   * true = enable/CS pin that is implicitly consumed when the primary bus is connected.
   * Not rendered as a wirable port; counted automatically toward MCU GPIO pool.
   */
  implicit?: boolean;
}

export interface ModuleDefinition {
  type: ModuleType;
  label: string;
  /** Shorter label for the floating toolbar. Falls back to label if absent. */
  toolbarLabel?: string;
  description: string;
  colorGroup: 'sensor' | 'actuator' | 'display' | 'storage' | 'control' | 'core';
  ports: PortDef[];
}

/** Default number of slots per expandable bus when MCU is first placed */
export const DEFAULT_MCU_BUS_SLOTS: Record<string, number> = {
  I2C: 1,
  SPI: 1,
  UART: 1,
  NEOPIXEL: 1,
};

export interface PlacedModule {
  id: string;
  type: ModuleType;
  x: number;
  y: number;
  /** MCU only: tracks how many slots have been expanded per bus type */
  mcuBusSlots?: Record<string, number>;
}

export interface Wire {
  id: string;
  fromModuleId: string;
  fromPortId: string;
  toModuleId: string;
  toPortId: string;
}

export interface CanvasState {
  modules: PlacedModule[];
  wires: Wire[];
}
