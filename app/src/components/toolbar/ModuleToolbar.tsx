// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { MODULE_DEFINITIONS } from '../../data/moduleDefinitions';
import { ModuleType } from '../../types';
import ToolbarItem from './ToolbarItem';
import styles from './ModuleToolbar.module.css';

interface ModuleToolbarProps {
  pos: { x: number; y: number };
  onPosChange: (pos: { x: number; y: number }) => void;
}

interface ToolbarGroup {
  label: string;
  types: ModuleType[];
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  { label: 'MCU', types: ['MCU'] },
  {
    label: 'Sensor Components',
    types: [
      'CELL_READER_4_CG',
      'CELL_READER_4_DIFF',
      'CELL_READER_8_CG',
      'CELL_READER_8_DIFF',
      'PRESSURE_SENSOR',
      'CO2_TEMP_STICK',
      'WATER_CONTACT',
      'BATT_VOLTAGE_SENSOR',
      'BATT_MANAGEMENT',
    ],
  },
  {
    label: 'Cells',
    types: ['O2_CELL_ANALOG', 'O2_CELL_DIGITAL', 'CO_SENSOR', 'CO2_SENSOR', 'HE_SENSOR'],
  },
  { label: 'Actuators', types: ['SOLENOID', 'BUZZER'] },
  {
    label: 'Displays',
    types: ['STATUS_LIGHT', 'HUD_3LED', 'HUD_6LED', 'DECO_HUD', 'PPO2_DISPLAY', 'GENERAL_SCREEN'],
  },
  { label: 'Storage & Controls', types: ['FLASH_MEMORY', 'BUTTONS', 'ROTARY_ENCODER'] },
];

export default function ModuleToolbar({ pos, onPosChange }: ModuleToolbarProps) {
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[draggable]')) return;
    e.preventDefault();
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    function onMove(ev: PointerEvent) {
      onPosChange({ x: ev.clientX - startX, y: ev.clientY - startY });
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  return (
    <div className={styles.toolbar} style={{ left: pos.x, top: pos.y }}>
      <div className={styles.handle} onPointerDown={handlePointerDown}>
        <span className={styles.handleTitle}>Modules</span>
      </div>
      <div className={styles.items}>
        {TOOLBAR_GROUPS.map((group) => (
          <div key={group.label}>
            <div className={styles.groupLabel}>{group.label}</div>
            <div className={`${styles.grid} ${group.types.length === 1 ? styles.gridSingle : ''}`}>
              {group.types.map((type) => {
                const def = MODULE_DEFINITIONS[type];
                return <ToolbarItem key={type} def={def} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
