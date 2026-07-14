// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useState, useCallback } from 'react';
import storage from './storage';

function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    return storage.getItem<T>(key, defaultValue) ?? defaultValue;
  });

  const setStorageValue = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prevValue) => {
        const newValue = typeof v === 'function' ? (v as (prev: T) => T)(prevValue) : v;
        storage.setItem(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  const clearValue = useCallback(() => {
    storage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setStorageValue, clearValue];
}

export default useStorage;
