# Inventory Integration Boundary

**Date:** 2026-08-09
**Status:** Canonical

## Two different projects

| Project | Purpose |
|---------|---------|
| **AMQUR Platform** (`amqur-backend` / `amqur-widget`) | Dealership AI operating system: chat, inventory *consumption*, CRM orchestration, service/parts/finance assistants, knowledge, widget |
| **Dial Auto Group VLA / vauto-gmc-automation** | vAuto exports → SFTP → Merchant Center / Vehicle Ads feed publishing |

These must remain separate.

## Correct data flow

```
vAuto / inventory provider
        ↓
dedicated inventory-feed infrastructure (outside AMQUR)
        ↓
verified normalized inventory contract (HTTPS JSON/XML/CSV)
        ↓
AMQUR Inventory Provider Adapter
  - VAutoFeedProvider (HTTPS feed)
  - NormalizedInventoryHttpProvider (provider: normalized_inventory_http)
        ↓
AMQUR inventory database (Vehicle + InventoryImportRun)
        ↓
Truth engine / Sales AI / widget / staff
```

## What AMQUR must NOT become

- SFTPGo administration
- Google Merchant Center publisher
- Caddy feed host
- Vehicle Ads feed generator
- DigitalOcean SFTP host

## Contamination audit (2026-07-24 / reconfirmed 2026-08-09)

Merchant Center / SFTPGo / `feeds.dialautogroup.com` / `sftp.dialautogroup.com` automation was **never committed** to AMQUR repos. See `backend/docs/ops/VAUTO_MERCHANT_CENTER_ROLLBACK_NOTE.md` if present, or workspace `.rollback-backups/`.

Legitimate AMQUR inventory abstractions **preserved**:

- `InventoryFeedProvider`
- `VAUTO` / `NORMALIZED_INVENTORY_HTTP` provider enums
- import runs, freshness, anomaly guards, VIN normalization

## Normalized inventory HTTP contract (AMQUR consumer)

Configuration shape (IntegrationConnection / location feed config):

```json
{
  "provider": "normalized_inventory_http",
  "endpoint": "https://inventory.example.com/feeds/tenant-slug.json",
  "authRef": "integration_secret_id_or_env",
  "format": "JSON",
  "schemaVersion": "1",
  "pollMinutes": 30,
  "freshnessSlaHours": 24
}
```

Security (enforced in code):

- SSRF guard (`assertFeedUrlAllowed`)
- HTTPS in production
- optional `INVENTORY_FEED_ALLOWED_HOSTS`
- timeouts, bounded payload size, checksum, schema validation
- never mark all vehicles sold on empty/anomalous snapshots

Expected JSON array item fields: `vin`, `stockNumber`, `year`, `make`, `model`, `trim`, `condition`, `price`/`advertisedPrice`, `msrp`, `mileage`, `status`, `images`, `features`, `sourceTimestamp`, `locationExternalId`.

Live feed URLs and vendor credentials remain **external activation**.
