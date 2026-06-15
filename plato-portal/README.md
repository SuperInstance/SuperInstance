# Plato Private Fleet Portal Dashboard

Real-time metrics dashboard for Cloudflare Workers fleets built on Cloudflare Pages + Functions.

## Features

- 📊 Real-time fleet metrics visualization
- 📈 Active workers monitoring
- 📅 Daily event tracking
- ⏰ Auto-refreshing every 30 seconds
- 🎨 Modern Tailwind CSS UI

## Tech Stack

- **Frontend**: Vanilla HTML/JS + Tailwind CSS
- **Backend**: Cloudflare Pages Functions + TypeScript
- **Database**: Cloudflare D1
- **Caching**: Cloudflare KV

## Prerequisites

1. Node.js 18+ installed
2. Wrangler CLI installed: `npm install -g wrangler`
3. Cloudflare account with Pages, D1, and KV access

## Setup

### 1. Configure Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create fleet-events

# Create KV namespace
wrangler kv:namespace create fleet-metrics-kv
```

### 2. Update Wrangler Config

Update `wrangler.jsonc` with your actual database and KV namespace IDs:

```json
{
  "name": "plato-portal",
  "compatibility_date": "2026-06-15",
  "pages": {
    "build": {
      "command": "",
      "directory": "public"
    }
  },
  "bindings": {
    "KV_FLEET_METRICS": "<your-kv-namespace-id>",
    "D1_FLEET_DB": "<your-d1-database-id>"
  }
}
```

### 3. Initialize Database Schema

```bash
wrangler d1 execute fleet-events --file schema.sql
```

### 4. Develop Locally

```bash
wrangler pages dev --d1 fleet-events --kv fleet-metrics-kv
```

The dashboard will be available at `http://localhost:8788`

### 5. Deploy to Production

```bash
wrangler pages deploy
```

## API Endpoints

### `GET /api/metrics`
Returns real-time fleet metrics:
```json
{
  "totalFleets": 12,
  "activeWorkers": 8,
  "todayEvents": 145,
  "events": [
    {
      "timestamp": "2026-06-15T17:00:00.000Z",
      "fleetId": "fleet-123",
      "metricType": "cpu_usage",
      "value": "78"
    }
  ]
}
```

## Adding Metrics Data

To send metrics to the dashboard, use this example Worker script:

```typescript
async function recordFleetMetric(fleetId: string, metricType: string, value: string) {
  await fetch('https://your-portal-domain.com/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fleetId,
      metricType,
      value
    })
  });
}
```

## License

MIT