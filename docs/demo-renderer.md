# ABECMS demo renderer

A small, standalone HTTP gateway that renders a **fixed** Abe template through
the **real ABECMS rendering engine** (`abecms.Page`). It is meant to power a
public demo (livingcolor.fr) without exposing any part of the ABECMS back
office.

## What it is not

The gateway mounts **no** ABECMS administration surface. There is no
`/abe`, `/abe/users`, `/abe/build-template`, `/abe/page/...`, editor, plugin,
operation, source, theme browser, upload or static-file route. Requests to any
unknown path return `404 {"error":"not_found"}`.

Callers cannot supply a template, a template name, a key, a path, a URL, rich
HTML, or any field outside the four declared below.

## Rendering path

`POST /render` →
`src/demo/schema.js` (allowlist validation) →
`src/demo/renderer.js` →
`new Page(template, json, true)` from `src/cli/cms/Page.js` (the ABECMS product
class) → Abe tag preparation + Handlebars compilation → HTML.

The template is `demo/site/themes/default/templates/demo.html` and the ABECMS
config root is pinned to `demo/site/`, both baked into the image.
`tests/gateway/engine.js` asserts that the gateway's `Page` is identity-equal to
the one exported by the ABECMS entrypoint and that the output matches a direct
`new Page(...)` call byte for byte.

## API contract

Base URL: the gateway port (8080 by default). JSON only. No CORS layer at all —
the gateway is called server to server.

### `GET /health`

```json
{
  "status": "ok",
  "engine": {
    "name": "abecms",
    "version": "5.12.0",
    "renderer": "abecms.Page",
    "module": "dist/cli/cms/Page.js",
    "template": "themes/default/templates/demo.html",
    "templateEngine": "handlebars"
  },
  "uptime": 42
}
```

### `GET /schema`

Returns the frozen content schema: `version`, `maxPayloadBytes` and the field
list.

### `POST /render`

`Content-Type: application/json` is mandatory. Body must be a JSON object of at
most **8192 bytes**.

| Field          | Type              | Required | Max length | Notes                       |
| -------------- | ----------------- | -------- | ---------- | --------------------------- |
| `title`        | string            | yes      | 120        | Plain text                  |
| `introduction` | string            | no       | 600        | Plain text, newlines kept   |
| `ctaLabel`     | string            | no       | 60         | Plain text                  |
| `status`       | `draft`/`published` | no     | —          | Defaults to `draft`         |

Request:

```bash
curl -s -X POST http://127.0.0.1:8080/render \
  -H 'content-type: application/json' \
  -d '{"title":"Living Color","introduction":"Hello","ctaLabel":"Go","status":"published"}'
```

Response `200`:

```json
{
  "html": "<!doctype html>...",
  "content": {"title": "...", "introduction": "...", "ctaLabel": "...", "status": "published"},
  "engine": {"name": "abecms", "version": "5.12.0", "renderer": "abecms.Page", "...": "..."}
}
```

`html` is escaped by the ABECMS Handlebars pipeline: user text can never inject
markup, script, Abe tags or Handlebars expressions.

### Errors

| Status | `error`                  | Cause                                      |
| ------ | ------------------------ | ------------------------------------------ |
| 400    | `invalid_body`           | Body is not a JSON object                  |
| 400    | `invalid_json`           | Malformed JSON                             |
| 400    | `unknown_field`          | Field outside the allowlist                |
| 400    | `missing_field`          | `title` missing or empty                   |
| 400    | `invalid_type`           | Field is not a string                      |
| 400    | `invalid_value`          | `status` outside the enum                  |
| 400    | `too_long`               | Field exceeds its max length               |
| 404    | `not_found`              | Unknown route                              |
| 405    | `method_not_allowed`     | Method not allowed on a published route    |
| 413    | `payload_too_large`      | Body over 8192 bytes                       |
| 415    | `unsupported_media_type` | `Content-Type` is not `application/json`   |
| 429    | `rate_limited`           | Rate-limit window exhausted                |
| 503    | `timeout`                | Request exceeded the processing timeout    |

## Configuration

| Variable                  | Default   | Purpose                                              |
| ------------------------- | --------- | ---------------------------------------------------- |
| `ABE_DEMO_PORT`           | `8080`    | Listening port                                       |
| `ABE_DEMO_HOST`           | `0.0.0.0` | Bind address                                         |
| `ABE_DEMO_RATE_MAX`       | `60`      | Requests per window per client IP                    |
| `ABE_DEMO_RATE_WINDOW_MS` | `60000`   | Rate-limit window                                    |
| `ABE_DEMO_TIMEOUT_MS`     | `5000`    | Per-request processing timeout                       |
| `ABE_DEMO_TRUST_PROXY`    | `false`   | Trust `X-Forwarded-For` (only behind a trusted proxy) |
| `ABE_DEMO_SITE_ROOT`      | bundled   | Override the demo site root (testing only)           |

No secret is required and none must be committed.

## Run locally

From sources:

```bash
npm ci
npm run test:demo
npm run dev:demo          # http://127.0.0.1:8080
```

With Docker Compose:

```bash
docker compose -f compose.demo.yaml up --build
curl -s http://127.0.0.1:8080/health
```

Plain Docker:

```bash
docker build -f Dockerfile.demo -t ghcr.io/abecms/abecms-demo:local .
docker run --rm -p 127.0.0.1:8080:8080 \
  --read-only --tmpfs /tmp:size=16m \
  --cap-drop ALL --security-opt no-new-privileges:true \
  ghcr.io/abecms/abecms-demo:local
```

The image runs as the unprivileged `node` user (uid 1000), mounts **no host
volume**, and needs **no outbound network** — it starts and serves correctly
under `docker run --network none`.

## Production hardening

1. **No outbound network.** Deploy with egress disabled (`--network none` plus a
   published-port proxy, or a security group / network policy that allows only
   the ingress port). Nothing in the runtime path performs an outbound call.
2. **Read-only root filesystem** with a small `tmpfs` on `/tmp`.
3. **Drop all capabilities**, `no-new-privileges`, non-root user, `pids_limit`
   and a memory limit (see `compose.demo.yaml`).
4. **Terminate TLS upstream.** Put the gateway behind a reverse proxy that
   enforces HTTPS, a request-body limit and its own rate limit. Set
   `ABE_DEMO_TRUST_PROXY=true` only if that proxy is trusted and sets
   `X-Forwarded-For`.
5. **Expose only the gateway port.** Never publish any other port from the
   container or the host.
6. **Do not add CORS.** Calls come from the livingcolor.fr backend. If a browser
   ever needs direct access, allow one exact origin — never `*`.
7. **Keep the image immutable.** Deploy by digest, not by moving tag.

## CI / publishing

`.github/workflows/demo-renderer.yml` runs unit tests, gateway tests and the
distribution build, then builds `ghcr.io/abecms/abecms-demo`. Images are pushed
to GHCR only on `push` to `master` / `update` and on `v*` tags; pull requests
build and smoke-test the image without pushing. The workflow default permission
is `contents: read`; `packages: write` is granted to the build job only.

## Rollback

- **Container:** redeploy the previous image digest
  (`docker pull ghcr.io/abecms/abecms-demo@sha256:...`), or `docker compose -f
  compose.demo.yaml down && docker compose -f compose.demo.yaml up -d` pinned to
  the previous tag. The gateway is stateless: there is nothing to migrate back.
- **Code:** the demo lives entirely in `src/demo/`, `demo/`, `tests/gateway/`,
  `Dockerfile.demo`, `compose.demo.yaml` and this document. Reverting the
  `feat(demo):` and container commits removes it without touching the ABECMS
  runtime. `git revert <sha>` is sufficient; no ABECMS source file was modified.
- **Dependencies:** `chore: refresh patched dependencies` is a standalone commit
  that can be reverted on its own; run `npm ci` afterwards.
