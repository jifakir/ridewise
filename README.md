# RideWise

Offline-first personal wallet for riders. **Spend smart. Ride more.**

**Milestones (source of truth):** [MILESTONES.md](MILESTONES.md) — both developers update that file, not Cursor-only plans.

One git repo, three independent sibling apps. Each has its own `node_modules`.

| Folder | App | Setup | Run |
| --- | --- | --- | --- |
| `mobile-app/` | Expo (iOS / Android) | `cd mobile-app && npm install` | `npm run mobile` |
| `landing/` | Next.js marketing site | `cd landing && npm install` | `npm run landing` |
| `api/` | Next.js API (future sync) | `cd api && npm install` | `npm run api` |

V1 of the mobile app is fully local (SQLite). The API exists so cloud sync can be added later without splitting the repo.
