# arjun.systems hub

Internal systems hub for `arjun.systems`, built with Next.js App Router + TypeScript + Tailwind CSS.

## Run locally

1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open `http://localhost:3000`.

## Lint

```bash
npm run lint
```

## Environment variables

None required.

## Add a new service

1. Edit [lib/services.ts](./lib/services.ts).
2. Add one object to the `services` array with:
   - `id` (unique slug)
   - `name` (display name)
   - `description` (short summary)
   - `url` (tool URL)
   - `healthUrl` (JSON health endpoint)
   - `tags` (optional)
3. Keep the health endpoint response shape:

```json
{
  "status": "ok",
  "service": "service-id",
  "timestamp": "2026-02-26T18:52:00.000Z"
}
```

No UI changes are needed. The homepage tools grid and status table are data-driven from this array.

## Status logic

- API route: `GET /api/status`
- Health checks run in parallel with per-service timeout (`23s`).
- Rules:
  - `online`: fetch succeeds, `status === "ok"`, timestamp is not stale
  - `degraded`: fetch succeeds but `status !== "ok"` or timestamp is stale (`> 5 minutes`)
  - `offline`: fetch fails, times out, invalid payload, or non-2xx response
- Each service entry includes:
  - `id`, `name`, `url`
  - `state`
  - optional `health`
  - `checkedAt`
  - `latencyMs`
  - optional `error`
- In-memory cache TTL is `15s`.
- Use `/api/status?force=true` to bypass cache.

## Deployment (Vercel)

1. Import this repository into Vercel.
2. Deploy and add the custom domain `arjun.systems`.
3. Confirm DNS records and HTTPS provisioning are complete.
