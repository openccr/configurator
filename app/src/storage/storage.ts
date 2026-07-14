// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

const PREFIX = 'openccr.';

function getItem<T>(key: string, defaultValue?: T): T | null {
  const prefixedKey = PREFIX + key;
  try {
    const item = localStorage.getItem(prefixedKey);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch {
    // If parsing fails, return default value
    return defaultValue ?? null;
  }
}

function setItem<T>(key: string, value: T): void {
  const prefixedKey = PREFIX + key;
  localStorage.setItem(prefixedKey, JSON.stringify(value));
}

function removeItem(key: string): void {
  const prefixedKey = PREFIX + key;
  localStorage.removeItem(prefixedKey);
}

function clear(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function keys(): string[] {
  const result: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      result.push(key.slice(PREFIX.length));
    }
  }
  return result;
}

const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  keys,
};

export default storage;
