---
name: ridewise-mobile
description: >-
  Implements RideWise Expo mobile-app (SDK 57, NativeWind v4, Expo Router).
  Use when working in mobile-app/, Home, expenses, fuel, bike, wallet, NativeWind,
  or the next RideWise milestone. Do not use for api/ or landing/ unless the user
  explicitly names those folders.
---

# RideWise mobile-app

Offline-first rider wallet. Product source of truth: [ProjectBlueprint.md](../../../ProjectBlueprint.md). Stack details: [reference.md](reference.md).

## Scope

- Default work is **`mobile-app/` only**.
- Do not create, edit, delete, or install in **`api/`** or **`landing/`** until the user commands it.
- One feature milestone at a time. After a feature ships, stop and wait for approval before the next.

## Stack (do not change without asking)

- Expo SDK 57, Expo Router, TypeScript
- NativeWind v4 + Tailwind CSS **3.4** (`className` only — no `StyleSheet.create`)
- Brand colors in `mobile-app/tailwind.config.js` (`primary`, `ink`, `foreground`, `muted`, `canvas`, `card`)
- Run from repo root: `npm run mobile`. Install deps inside `mobile-app/`.

## Architecture

`UI → feature logic → repository → SQLite`

Screens must not run raw SQL. V1 is local-only: no auth, no backend, no cloud.

## Product rules

- Primary CTA language: **Add Expense**. Bike UI: **My Bike**. Wallet: **Your Money**.
- Money first, bike second. Do not let bike stats dominate Home.
- Orange (`#F05A28`) is ~10% of UI — actions and important numbers, not every surface.
- Home spend and bike blocks use the same **white `bg-card`** as wallets/recent. Do not restyle Home unsolicited.
- Currency in UI: **BDT (৳)** until settings exist.
- V1 UI: one active bike. Data model may allow more.

## UI workflow

1. Keep existing Home/tab structure unless the user asks to change it.
2. New screens follow NativeWind tokens and placeholder patterns already in `mobile-app/src/components`.
3. Empty states stay honest (zeros / “not yet”), not fake charts.

## Next milestones (after M1)

M2 Welcome → M3 Bike setup → M4 SQLite → M5 Repos + categories → M6 Add Expense → M7 Transactions list → M8 Edit/delete → M9 Bike profile → M10 Add Fuel → M11 Mileage → M12 Live Home → M13 Reports → M14 Backup export → M15 Restore → M16 Polish.
