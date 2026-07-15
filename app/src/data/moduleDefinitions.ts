// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { ModuleDefinition, ModuleType, PortDef } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const i2c = (id = 'I2C'): PortDef => ({
  id,
  label: 'I2C',
  busType: 'I2C',
  direction: 'out',
  multiDrop: true,
});

const spi = (id = 'SPI'): PortDef => ({
  id,
  label: 'SPI',
  busType: 'SPI',
  direction: 'bidir',
  multiDrop: false,
});

const uart = (id = 'UART'): PortDef => ({
  id,
  label: 'UART',
  busType: 'UART',
  direction: 'out',
  multiDrop: false,
});

const gpioIn = (id: string, label = 'GPIO', implicit = false): PortDef => ({
  id,
  label,
  busType: 'GPIO',
  direction: 'in',
  multiDrop: false,
  ...(implicit ? { implicit: true } : {}),
});

const gpioOut = (id: string, label = 'GPIO'): PortDef => ({
  id,
  label,
  busType: 'GPIO',
  direction: 'out',
  multiDrop: false,
});

const npIn = (): PortDef => ({
  id: 'NP_IN',
  label: 'NeoPixel In',
  busType: 'NEOPIXEL',
  direction: 'in',
  multiDrop: false,
  rightSide: false,
});

const npOut = (): PortDef => ({
  id: 'NP_OUT',
  label: 'NeoPixel Out',
  busType: 'NEOPIXEL',
  direction: 'out',
  multiDrop: false,
  rightSide: true,
});

/** ADC port for an analog cell — left edge so it faces the cell reader to its right */
const adcCell = (): PortDef => ({
  id: 'CELL',
  label: 'Cell',
  busType: 'ADC',
  direction: 'out',
  multiDrop: false,
  rightSide: false,
});

/** ADC input on a cell reader — right edge, accepts analog cells from the right */
const adcIn = (id: string, label: string): PortDef => ({
  id,
  label,
  busType: 'ADC',
  direction: 'in',
  multiDrop: false,
  rightSide: true,
});

const solenoidOut = (id: string, label: string): PortDef => ({
  id,
  label,
  busType: 'SOLENOID',
  direction: 'out',
  multiDrop: false,
  rightSide: true,
});

const solenoidIn = (): PortDef => ({
  id: 'SOLENOID_IN',
  label: 'Solenoid',
  busType: 'SOLENOID',
  direction: 'in',
  multiDrop: false,
});

// ── Module Definitions ────────────────────────────────────────────────────────

export const MODULE_DEFINITIONS: Record<ModuleType, ModuleDefinition> = {
  MCU: {
    type: 'MCU',
    label: 'MCU',
    description: 'Microcontroller — hub of the CCR system. Ports expand dynamically.',
    colorGroup: 'core',
    ports: [], // MCU ports generated dynamically via getMcuPorts() in portUtils
  },

  // ── O₂ Cell Readers ─────────────────────────────────────────────────────────
  CELL_READER_4_CG: {
    type: 'CELL_READER_4_CG',
    label: '4-Port Cell Reader (CG)',
    toolbarLabel: 'Reader 4×CG',
    description: 'Common-ground ADC board. 4 analog cell inputs. I2C data + GPIO enable.',
    colorGroup: 'sensor',
    ports: [
      adcIn('CELL-1', 'Cell 1'),
      adcIn('CELL-2', 'Cell 2'),
      adcIn('CELL-3', 'Cell 3'),
      adcIn('CELL-4', 'Cell 4'),
      i2c(),
      gpioIn('GPIO_EN', 'Enable', true),
    ],
  },
  CELL_READER_4_DIFF: {
    type: 'CELL_READER_4_DIFF',
    label: '4-Port Cell Reader (Diff)',
    toolbarLabel: 'Reader 4×Diff',
    description: 'Differential ADC board. 4 channels → 2 cells. I2C data + GPIO enable.',
    colorGroup: 'sensor',
    ports: [
      adcIn('CELL-1', 'Cell 1'),
      adcIn('CELL-2', 'Cell 2'),
      i2c(),
      gpioIn('GPIO_EN', 'Enable', true),
    ],
  },
  CELL_READER_8_CG: {
    type: 'CELL_READER_8_CG',
    label: '8-Port Cell Reader (CG)',
    toolbarLabel: 'Reader 8×CG',
    description: 'Common-ground ADC board. 8 analog cell inputs. I2C data + GPIO enable.',
    colorGroup: 'sensor',
    ports: [
      adcIn('CELL-1', 'Cell 1'),
      adcIn('CELL-2', 'Cell 2'),
      adcIn('CELL-3', 'Cell 3'),
      adcIn('CELL-4', 'Cell 4'),
      adcIn('CELL-5', 'Cell 5'),
      adcIn('CELL-6', 'Cell 6'),
      adcIn('CELL-7', 'Cell 7'),
      adcIn('CELL-8', 'Cell 8'),
      i2c(),
      gpioIn('GPIO_EN', 'Enable', true),
    ],
  },
  CELL_READER_8_DIFF: {
    type: 'CELL_READER_8_DIFF',
    label: '8-Port Cell Reader (Diff)',
    toolbarLabel: 'Reader 8×Diff',
    description: 'Differential ADC board. 8 channels → 4 cells. I2C data + GPIO enable.',
    colorGroup: 'sensor',
    ports: [
      adcIn('CELL-1', 'Cell 1'),
      adcIn('CELL-2', 'Cell 2'),
      adcIn('CELL-3', 'Cell 3'),
      adcIn('CELL-4', 'Cell 4'),
      i2c(),
      gpioIn('GPIO_EN', 'Enable', true),
    ],
  },

  // ── Analog Cells ─────────────────────────────────────────────────────────────
  O2_CELL_ANALOG: {
    type: 'O2_CELL_ANALOG',
    label: 'Analog O₂ Cell',
    toolbarLabel: 'O₂ Analog',
    description: 'Galvanic O₂ cell. Connects to a cell reader ADC input.',
    colorGroup: 'sensor',
    ports: [adcCell()],
  },
  CO_SENSOR: {
    type: 'CO_SENSOR',
    label: 'Analog CO Cell',
    toolbarLabel: 'CO Cell',
    description: 'Electrochemical CO cell. Connects to a cell reader ADC input.',
    colorGroup: 'sensor',
    ports: [adcCell()],
  },
  CO2_SENSOR: {
    type: 'CO2_SENSOR',
    label: 'Analog CO₂ Cell',
    toolbarLabel: 'CO₂ Cell',
    description: 'Electrochemical CO₂ cell. Connects to a cell reader ADC input.',
    colorGroup: 'sensor',
    ports: [adcCell()],
  },
  HE_SENSOR: {
    type: 'HE_SENSOR',
    label: 'Analog He Cell',
    toolbarLabel: 'He Cell',
    description: 'Thermal conductivity He cell. Connects to a cell reader ADC input.',
    colorGroup: 'sensor',
    ports: [adcCell()],
  },

  // ── Digital O₂ Cell ─────────────────────────────────────────────────────────
  O2_CELL_DIGITAL: {
    type: 'O2_CELL_DIGITAL',
    label: 'Digital O₂ Cell',
    toolbarLabel: 'O₂ Digital',
    description: 'Digital O₂ cell with UART output. Connects directly to MCU.',
    colorGroup: 'sensor',
    ports: [uart()],
  },

  // ── Environmental Sensors (I2C → MCU) ────────────────────────────────────────
  PRESSURE_SENSOR: {
    type: 'PRESSURE_SENSOR',
    label: 'Pressure Sensor',
    toolbarLabel: 'Pressure',
    description:
      'Combined depth and barometric pressure sensor. Provides depth in water and barometric reference in air.',
    colorGroup: 'sensor',
    ports: [i2c()],
  },
  CO2_TEMP_STICK: {
    type: 'CO2_TEMP_STICK',
    label: 'Scrubber Temp Stick',
    toolbarLabel: 'Scrubber Temp',
    description: 'Temperature monitoring for CO₂ scrubber exhaustion detection.',
    colorGroup: 'sensor',
    ports: [i2c()],
  },
  WATER_CONTACT: {
    type: 'WATER_CONTACT',
    label: 'Water Contact Sensor',
    toolbarLabel: 'Water Contact',
    description: 'Water ingress detection. Single GPIO pin.',
    colorGroup: 'sensor',
    ports: [gpioOut('GPIO')],
  },

  // ── Battery ──────────────────────────────────────────────────────────────────
  BATT_VOLTAGE_SENSOR: {
    type: 'BATT_VOLTAGE_SENSOR',
    label: 'Battery Voltage Sensor',
    toolbarLabel: 'Batt Voltage',
    description: 'Analog battery voltage monitoring via single GPIO pin.',
    colorGroup: 'sensor',
    ports: [gpioOut('GPIO')],
  },
  BATT_MANAGEMENT: {
    type: 'BATT_MANAGEMENT',
    label: 'Battery Management',
    toolbarLabel: 'Batt Mgmt',
    description: 'Battery management IC (charge control, state of charge). I2C.',
    colorGroup: 'sensor',
    ports: [i2c()],
  },

  // ── Actuators ────────────────────────────────────────────────────────────────
  SOLENOID_DRIVER_1PORT: {
    type: 'SOLENOID_DRIVER_1PORT',
    label: 'Solenoid Driver (1ch)',
    toolbarLabel: 'Sol. Driver 1ch',
    description: 'Single-channel gas solenoid driver (O₂ or diluent). One GPIO control pin, one solenoid output.',
    colorGroup: 'actuator',
    ports: [gpioIn('GPIO_1', 'GPIO 1'), solenoidOut('SOLENOID_1', 'Solenoid 1')],
  },
  SOLENOID_DRIVER_2PORT: {
    type: 'SOLENOID_DRIVER_2PORT',
    label: 'Solenoid Driver (2ch)',
    toolbarLabel: 'Sol. Driver 2ch',
    description: 'Dual-channel gas solenoid driver. Two GPIO control pins, two solenoid outputs.',
    colorGroup: 'actuator',
    ports: [
      gpioIn('GPIO_1', 'GPIO 1'),
      solenoidOut('SOLENOID_1', 'Solenoid 1'),
      gpioIn('GPIO_2', 'GPIO 2'),
      solenoidOut('SOLENOID_2', 'Solenoid 2'),
    ],
  },
  SOLENOID_DRIVER_4PORT: {
    type: 'SOLENOID_DRIVER_4PORT',
    label: 'Solenoid Driver (4ch)',
    toolbarLabel: 'Sol. Driver 4ch',
    description: 'Four-channel gas solenoid driver. Four GPIO control pins, four solenoid outputs.',
    colorGroup: 'actuator',
    ports: [
      gpioIn('GPIO_1', 'GPIO 1'),
      solenoidOut('SOLENOID_1', 'Solenoid 1'),
      gpioIn('GPIO_2', 'GPIO 2'),
      solenoidOut('SOLENOID_2', 'Solenoid 2'),
      gpioIn('GPIO_3', 'GPIO 3'),
      solenoidOut('SOLENOID_3', 'Solenoid 3'),
      gpioIn('GPIO_4', 'GPIO 4'),
      solenoidOut('SOLENOID_4', 'Solenoid 4'),
    ],
  },
  SOLENOID_VALVE: {
    type: 'SOLENOID_VALVE',
    label: 'Solenoid Valve',
    toolbarLabel: 'Sol. Valve',
    description: 'Physical gas solenoid valve. Connects to a solenoid driver output.',
    colorGroup: 'actuator',
    ports: [solenoidIn()],
  },
  BUZZER: {
    type: 'BUZZER',
    label: 'Buzzer',
    description: 'Audible alarm buzzer. Requires 2 GPIO pins.',
    colorGroup: 'actuator',
    ports: [gpioIn('GPIO_1', 'GPIO 1'), gpioIn('GPIO_2', 'GPIO 2')],
  },

  // ── NeoPixel Chain Devices ──────────────────────────────────────────────────
  STATUS_LIGHT: {
    type: 'STATUS_LIGHT',
    label: 'Status Light',
    toolbarLabel: 'Status LED',
    description: 'Single status LED. NeoPixel chain device.',
    colorGroup: 'display',
    ports: [npIn(), gpioIn('GPIO', 'GPIO (enable)', true), npOut()],
  },
  HUD_3LED: {
    type: 'HUD_3LED',
    label: 'HUD — 3 LED',
    toolbarLabel: 'HUD 3-LED',
    description: '3-LED HUD display. NeoPixel chain device.',
    colorGroup: 'display',
    ports: [npIn(), gpioIn('GPIO', 'GPIO (enable)', true), npOut()],
  },
  HUD_6LED: {
    type: 'HUD_6LED',
    label: 'HUD — 6 LED',
    toolbarLabel: 'HUD 6-LED',
    description: '6-LED HUD display. NeoPixel chain device.',
    colorGroup: 'display',
    ports: [npIn(), gpioIn('GPIO', 'GPIO (enable)', true), npOut()],
  },
  DECO_HUD: {
    type: 'DECO_HUD',
    label: 'Deco HUD',
    description: 'Decompression HUD display. NeoPixel chain device.',
    colorGroup: 'display',
    ports: [npIn(), gpioIn('GPIO', 'GPIO (enable)', true), npOut()],
  },

  // ── Displays ─────────────────────────────────────────────────────────────────
  PPO2_DISPLAY: {
    type: 'PPO2_DISPLAY',
    label: 'ppO₂ Display',
    description: 'Dedicated ppO₂ readout display. I2C data + GPIO chip-select.',
    colorGroup: 'display',
    ports: [i2c(), gpioIn('GPIO_CS', 'CS', true)],
  },
  GENERAL_SCREEN: {
    type: 'GENERAL_SCREEN',
    label: 'General Screen',
    toolbarLabel: 'Screen',
    description: 'Multi-purpose SPI display.',
    colorGroup: 'display',
    ports: [spi()],
  },

  // ── Storage & Control ────────────────────────────────────────────────────────
  FLASH_MEMORY: {
    type: 'FLASH_MEMORY',
    label: 'Flash / Log Memory',
    toolbarLabel: 'Flash',
    description: 'Non-volatile SPI flash for dive log storage.',
    colorGroup: 'storage',
    ports: [spi()],
  },
  BUTTONS: {
    type: 'BUTTONS',
    label: 'Buttons',
    toolbarLabel: 'Buttons',
    description: 'User input buttons. Single GPIO.',
    colorGroup: 'control',
    ports: [gpioOut('GPIO')],
  },
  ROTARY_ENCODER: {
    type: 'ROTARY_ENCODER',
    label: 'Rotary Encoder',
    toolbarLabel: 'Encoder',
    description: 'Rotary encoder with I2C data and GPIO button pin.',
    colorGroup: 'control',
    ports: [i2c(), gpioOut('GPIO_BTN', 'Button')],
  },
};

export const MODULE_DEFINITION_LIST: ModuleDefinition[] = Object.values(MODULE_DEFINITIONS);

/** Number of O₂ cell slots exposed by each cell reader type */
export const CELL_READER_CAPACITY: Partial<Record<ModuleType, number>> = {
  CELL_READER_4_CG: 4,
  CELL_READER_4_DIFF: 2,
  CELL_READER_8_CG: 8,
  CELL_READER_8_DIFF: 4,
};
