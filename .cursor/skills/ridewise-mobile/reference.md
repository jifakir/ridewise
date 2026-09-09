# RideWise mobile-app reference

## Repo

Independent siblings in one git repo. Each app has its own `node_modules`.

| Folder | Role | Touch? |
| --- | --- | --- |
| `mobile-app/` | Expo app | Yes (default) |
| `landing/` | Next.js marketing | Only if the user commands it |
| `api/` | Next.js API stub | Only if the user commands it |

## Key paths

- Screens: `mobile-app/app/(tabs)/`
- Home modules: `mobile-app/src/components/home/`
- Tab bar: `mobile-app/src/components/navigation/AppTabBar.tsx`
- Theme: `mobile-app/src/theme/colors.ts` + `mobile-app/tailwind.config.js`
- Future data: `mobile-app/src/repositories/`, `database/`, `services/`

## NativeWind

- Import `../global.css` from `app/_layout.tsx`
- `metro.config.js` uses `withNativeWind(..., { input: './global.css' })`
- Babel: `jsxImportSource: 'nativewind'` + `nativewind/babel`; last plugin `react-native-worklets/plugin`
- Icon tints that cannot use `className` read from `src/theme/colors.ts`

## Brand

| Token | Hex |
| --- | --- |
| primary | `#F05A28` |
| ink | `#151515` |
| foreground | `#171717` |
| muted | `#707070` |
| canvas | `#F6F6F4` |
| card | `#FFFFFF` |
| success | `#22A06B` |
| warning | `#F4B740` |
| danger | `#D64545` |

## V1 must-haves (from blueprint)

Onboarding, one active bike, general + bike categories, expense CRUD, fuel + ODO, mileage when data exists, monthly totals, general vs bike split, recent list, basic reports, JSON backup/restore.
