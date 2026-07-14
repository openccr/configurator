// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useMemo } from 'react';
import { CanvasState } from '../types';
import { FEATURE_RULES, FeatureRule } from '../data/featureRules';

export interface FeatureResult {
  rule: FeatureRule;
  unlocked: boolean;
  hint: string;
}

export function useFeatures(state: CanvasState): FeatureResult[] {
  return useMemo(
    () =>
      FEATURE_RULES.map((rule) => {
        const unlocked = rule.check(state.modules, state.wires);
        const hint = unlocked ? '' : rule.missingHint(state.modules, state.wires);
        return { rule, unlocked, hint };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.modules, state.wires]
  );
}
