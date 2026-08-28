# Production Backup Evidence

**Captured:** 2026-08-10T04:53Z (UTC)  
**Railway project:** `dial-us-now-platform` (`3bca40b6-01c6-4f02-9464-8682e6ffcb75`)  
**Workspace:** `saadimranhere's Projects`  
**Plan:** Hobby (`subscriptionModel: USER`)

## Volumes observed (production)

| Service | Volume name | Volume instance ID | Approx size |
|---------|-------------|--------------------|-------------|
| Postgres-RfDb | `postgres-volume-UTvg` | `c77c2079-7f5c-4070-8953-0111a38cee19` | ~159 MB |
| Redis-iqMb | `redis-volume-n8oT` | `06c17250-6794-4bca-877d-54bf8d4a11e5` | ~84 MB |

## Backup schedule / snapshots

| Check | Result |
|-------|--------|
| `volumeInstanceBackupScheduleList` (prod Postgres) | **Empty** — no schedules |
| `volumeInstanceBackupList` (prod Postgres) | **Empty** — no snapshots |
| `volumeInstanceBackupScheduleUpdate` | **Not Authorized** |
| `volumeInstanceBackupCreate` | **Not Authorized** |
| Plan limit `volumes.maxBackupsCount` | **0** |
| Plan limit `volumes.maxBackupsUsagePercent` | **0** |

## Verdict

**PARTIAL — EXTERNAL DEPENDENCY / PLAN LIMIT**

Railway Hobby on this workspace does **not** permit volume backups (`maxBackupsCount: 0`). Enabling a verified production backup schedule requires a Railway plan that includes volume backups (and dashboard/API authorization for schedule create).

**Do not claim backups are verified.** No successful backup timestamp exists.

## Rollback note (non-backup)

Application rollback remains available via Railway redeploy of prior successful deployments (see `docs/operations/ROLLBACK.md`). That is **not** a substitute for database volume backups.

## Next owner action

1. Upgrade Railway workspace plan (or move production DB to a plan with backups).  
2. Enable **daily** (and preferably weekly) volume backup schedule on `Postgres-RfDb` / `postgres-volume-UTvg`.  
3. Confirm at least one successful snapshot appears in `volumeInstanceBackupList`.  
4. Re-run this evidence capture and update this file.


## CI/CD note (2026-08-10T05:27Z)

GitHub Actions → Railway Deploy is **VERIFIED LIVE** for staging and production. Backup plan limits above are unchanged — Hobby still cannot enable volume backups.
