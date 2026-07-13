## Summary

<!-- What does this PR change and why? -->

## Affected Features

<!-- List the feature area(s) affected by this change,
     e.g., "PO₂ setpoint configuration" or "alarm threshold validation" -->

## Checklist

### Legal
- [ ] I have read and agree to the [openCCR CLA](../CLA.md)
- [ ] All new files include the correct SPDX license header

### Code Quality
- [ ] `npx prettier --check src/` passes with zero diffs
- [ ] `npx eslint src/` passes with zero warnings or errors
- [ ] `npm test` passes
- [ ] `npm run build` succeeds

### Safety (complete if applicable)
- [ ] Safety impact noted in PR description below (or N/A for non-safety-relevant changes)
- [ ] Changes to PO₂ setpoints, alarm thresholds, or calibration logic reviewed by 2+ contributors (names below)

### Documentation (complete if applicable)
- [ ] JSDoc comments updated for changed public APIs
- [ ] `docs/` updated if architecture changed

---

## Safety Impact

<!-- Does this change affect any of the following?
     - PO₂ setpoint configuration or validation
     - Alarm threshold configuration or range enforcement
     - Sensor calibration input or output
     - Configuration value persistence or transfer to device

     Describe what was changed and how correctness is maintained.

     Delete this section if the change is not safety-relevant. -->

## Safety Reviewers

<!-- GitHub usernames of contributors who reviewed this change.
     Required for changes affecting PO₂ setpoints, alarm thresholds, or calibration.
     Delete if not applicable. -->
