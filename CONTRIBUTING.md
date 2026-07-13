# Contributing to openCCR Configurator

We welcome contributions from the community. This document covers requirements specific to this repository. For general project policies, see the [openCCR website](https://openccr.github.io).

---

## Safety First

The configurator is used to set device parameters before and between dives. Misconfiguration — wrong PO₂ setpoints, incorrect alarm thresholds, or invalid sensor calibration values — could cause a dangerous dive. All contributions must reflect this:

- Changes that could cause misconfigured PO₂ setpoints, silent alarm suppression, or invalid calibration defaults must include a `[SAFETY]` tag in the PR description.
- Changes affecting any of the following require review by **at least two contributors** before merge:
  - PO₂ setpoint configuration and validation
  - Alarm threshold configuration and range enforcement
  - Sensor calibration input and output
- ESLint must produce **zero warnings or errors**. No lint suppressions without documented rationale.
- Prettier must produce **zero diffs**. Run it before every commit.

---

## The Legal Stuff (Important)

openCCR uses a dual-licensing model. All contributors must sign the CLA.

**By submitting a Pull Request, you agree that:**

1. Your contribution is governed by the [openCCR Contributor License Agreement v1.0](CLA.md).
2. You authorize the openCCR non-profit (and its authorized commercial partners) to utilize, modify, and dual-license your contributions without restriction.

You will be prompted to sign the CLA automatically on your first Pull Request via our CLA bot. Unsigned PRs cannot be merged.

---

## Tool Requirements

- **Node.js** ≥20
- **npm** ≥10 (or pnpm)
- **Vite** — bundler (installed via npm)

---

## How to Contribute

1. **Fork** this repository on GitHub.
2. **Sign the CLA** — prompted automatically on your first PR.
3. Install dependencies:
   ```
   npm install
   ```
4. Create a **feature branch** from `main`.
5. Make your changes following the coding guidelines below.
6. **Run Prettier** — zero diffs required:
   ```
   npx prettier --check src/
   ```
7. **Run ESLint** — zero warnings or errors:
   ```
   npx eslint src/
   ```
8. **Run tests**:
   ```
   npm test
   ```
9. **Verify build succeeds**:
   ```
   npm run build
   ```
10. **Add SPDX headers** to all new files (see below).
11. Open a **Pull Request** with a clear description of what changed and why. Include a safety note if the change affects PO₂ setpoints, alarm thresholds, or calibration logic.

---

## Coding Guidelines

### Style

Prettier is the sole style authority. Do not argue with it.

### Linting

ESLint is enforced. No suppressions (`// eslint-disable`) without a documented rationale in the same comment.

### Configuration defaults

No hard-coded configuration defaults for safety-relevant parameters (PO₂ setpoints, alarm thresholds, sensor calibration). All such values must come from validated device firmware or explicit user input.

### GATT UUIDs and constants

No hard-coded Bluetooth UUIDs in business logic. All GATT service and characteristic UUIDs must be defined as named constants in a shared definitions file and referenced by name.

### Input validation

All configuration values received from user input or from the device must be range-validated before use. Out-of-range or malformed values must produce a visible error — never silently accepted or discarded.

---

## License Headers

Add to all new JavaScript/TypeScript files:

```
// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors
```

Add to documentation files:

```
SPDX-License-Identifier: CC-BY-4.0
Copyright (c) 2026 openCCR contributors
```

---

## Reporting Issues

Open an issue on this repository. For defects that could affect diver safety — such as wrong PO₂ setpoints accepted, alarm thresholds not enforced, or calibration values silently clamped — mark the issue **[SAFETY]** in the title.

---

## Dual-Licensing Model

openCCR uses a dual-licensing model:

- **Open license** (GPL-3.0-or-later / CC BY 4.0) — for community use, research, and non-commercial builds.
- **Commercial license** — available to commercial partners through the openCCR non-profit, funding continued development and ISO standardization work.

The CLA enables the non-profit to issue commercial licenses without requiring individual permission from each contributor. This is standard practice for open-source projects with a non-profit steward (examples: Eclipse Foundation, Linux kernel).
