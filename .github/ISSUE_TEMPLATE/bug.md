---
name: Bug report
about: Report a defect in configuration logic, BLE connectivity, or UI behaviour
title: '[BUG] '
labels: bug
assignees: ''
---

## Browser / OS

<!-- Browser name and version, OS name and version, e.g.:
     Chrome 126 / Windows 11
     Safari 17.4 / macOS 14.4 -->

## App Version / Commit

<!-- Version string or full git SHA where the defect was observed -->

## Firmware Version

<!-- Git SHA of the firmware running on the connected openCCR controller -->

## BLE Connection State

<!-- Connection state at the time the bug occurred:
     Connected / Reconnecting / Disconnected -->

## Description

<!-- What is wrong? Be specific: which screen, which configuration field,
     what was observed vs what was expected. -->

## Safety Impact

<!-- Does this defect affect any of the following?
     - PO₂ setpoint (wrong value accepted, out-of-range not rejected)
     - Alarm threshold (threshold not enforced, silently clamped)
     - Sensor calibration (incorrect value written to device)

     If yes, prefix the issue title with [SAFETY] -->

## Reproduction Steps

<!-- Minimal reproduction: steps to trigger the defect,
     including device state, BLE state, and any browser settings involved -->

## Proposed Fix

<!-- If you know the correct logic or fix, describe it here -->
