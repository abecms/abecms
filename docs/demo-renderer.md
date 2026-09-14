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
`src/demo/rate-limit.js` →
`src/demo/auth.js` (bearer token) →
`src/demo/schema.js` (allowlist validation) →
`src/demo/renderer.js` →
`new Page(template, json, true)` from `src/cli/cms/Page.js` (the ABECMS product
class) → Abe tag preparation + Handlebars compilation → HTML.

The template is `demo/site/themes/default/templates/demo.html` and the ABECMS
config root is pinned to `demo/site/`, both baked into the image.
`tests/gateway/engine.js` asserts that the gateway's `Page` is identity-equal to
the one exported by the ABECMS entrypoint and that the output matches a direct
`new Page(...)` call byte for byte.

## Authentication

The gateway is a server-to-server endpoint protected by a shared bearer token.

| Endpoint | Credential |
| --- | --- |
| `GET /health` | **none** — kept open so container and load-balancer probes work without a secret |
| `GET /schema` | `Authorization: Bearer <token>` |
| `POST /render` | `Authorization: Bearer <token>` |

The token comes from `ABE_DEMO_API_TOKEN` and must be at least 32 characters.
Generate one with `openssl rand -hex 32`.

**The gateway fails closed at startup.** If `ABE_DEMO_API_TOKEN` is missing,
empty or too short, the process logs a single line without the token value and
exits with code 1. The only way to run without a credential is to set
`ABE_DEMO_ALLOW_UNAUTHENTICATED=true`, which is **development only** and prints
a warning on every start. `compose.demo.yaml` sets it so that a local
`docker compose up` works out of the box — never deploy with it.

Rules enforced on the header:

- The scheme is case-insensitive (`Bearer`, `bearer`, `BEARER` all work).
- The token must match the RFC 6750 `b64token` grammar. Anything else — no
  header, an empty token, a wrong scheme, trailing garbage, whitespace inside
  the token — is rejected.
- **Duplicated `Authorization` header lines are rejected outright.** Node keeps
  only the first one, so accepting duplicates would let a caller smuggle a
  second credential past the check.
- Comparison is constant time: both sides are SHA-256 hashed and compared with
  `crypto.timingSafeEqual`, and the comparison runs even when no token was
  presented so response time does not reveal the failure mode.
- The token is **never logged, never echoed** in a response body or header, and
  never appears in a configuration error message.

Every failure returns the exact same response, so the endpoint is not an oracle:

```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer

{"error":"unauthorized","message":"A valid bearer token is required."}
```

### Ordering: rate limit first, then authentication

Rate limiting runs **before** authentication, so a failed or absent credential
still consumes the caller's budget. This is the deliberate safe choice: an
anonymous attacker is throttled first and rejected with `401` second, long
before body parsing or ABECMS rendering — the only expensive work in the
process — can be reached. There is no free high-CPU path for an unauthenticated
caller, and no unlimited credential-guessing path either.

The route and method allowlist runs before authentication too, so unknown and
ABECMS back-office paths answer `404` identically whether or not a valid token
is presented. A credential never unlocks a wider route surface.

## API contract

Base URL: the gateway port (8080 by default). JSON only. No CORS layer at all —
the gateway is called server to server.

### `GET /health`

Unauthenticated.

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

Requires `Authorization: Bearer <token>`. Returns the frozen content schema:
`version`, `maxPayloadBytes` and the field list.

### `POST /render`

Requires `Authorization: Bearer <token>`. `Content-Type: application/json` is
mandatory. Body must be a JSON object of at most **8192 bytes**.

| Field          | Type              | Required | Max length | Notes                       |
| -------------- | ----------------- | -------- | ---------- | --------------------------- |
| `title`        | string            | yes      | 120        | Plain text                  |
| `introduction` | string            | no       | 600        | Plain text, newlines kept   |
| `ctaLabel`     | string            | no       | 60         | Plain text                  |
| `status`       | `draft`/`published` | no     | —          | Defaults to `draft`         |

Request:

```bash
curl -s -X POST http://127.0.0.1:8080/render \
  -H "authorization: Bearer $ABE_DEMO_API_TOKEN" \
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
| 401    | `unauthorized`           | Missing, malformed, duplicated or wrong bearer token |
| 404    | `not_found`              | Unknown route                              |
| 405    | `method_not_allowed`     | Method not allowed on a published route    |
| 413    | `payload_too_large`      | Body over 8192 bytes                       |
| 415    | `unsupported_media_type` | `Content-Type` is not `application/json`   |
| 429    | `rate_limited`           | Rate-limit window exhausted                |
| 503    | `timeout`                | Request exceeded the processing timeout    |

## Configuration

| Variable                  | Default   | Purpose                                              |
| ------------------------- | --------- | ---------------------------------------------------- |
| `ABE_DEMO_API_TOKEN`      | _none_    | **Required.** Shared bearer token, min. 32 chars. The process exits 1 if unset |
| `ABE_DEMO_ALLOW_UNAUTHENTICATED` | `false` | **Development only.** `true` disables the token requirement entirely |
| `ABE_DEMO_PORT`           | `8080`    | Listening port                                       |
| `ABE_DEMO_HOST`           | `0.0.0.0` | Bind address                                         |
| `ABE_DEMO_RATE_MAX`       | `60`      | Requests per window per client IP                    |
| `ABE_DEMO_RATE_WINDOW_MS` | `60000`   | Rate-limit window                                    |
| `ABE_DEMO_TIMEOUT_MS`     | `5000`    | Per-request processing timeout                       |
| `ABE_DEMO_TRUST_PROXY`    | `false`   | Trust `X-Forwarded-For` (only behind a trusted proxy) |
| `ABE_DEMO_SITE_ROOT`      | bundled   | Override the demo site root (testing only)           |

`ABE_DEMO_API_TOKEN` is the only secret. It is supplied at run time from the
deployment's secret store; **no token is committed to this repository or baked
into the image.**

## Run locally

From sources:

```bash
npm ci
npm run test:demo

export ABE_DEMO_API_TOKEN="$(openssl rand -hex 32)"
npm run dev:demo          # http://127.0.0.1:8080

curl -s http://127.0.0.1:8080/health                                  # 200, no token
curl -s -H "authorization: Bearer $ABE_DEMO_API_TOKEN" \
  http://127.0.0.1:8080/schema                                        # 200
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/schema # 401
```

With Docker Compose (**authentication disabled — development only**, see the
header of `compose.demo.yaml`):

```bash
docker compose -f compose.demo.yaml up --build
curl -s http://127.0.0.1:8080/health
```

Plain Docker, production-like:

```bash
docker build -f Dockerfile.demo -t ghcr.io/abecms/abecms-demo:local .
docker run --rm -p 127.0.0.1:8080:8080 \
  -e ABE_DEMO_API_TOKEN="$ABE_DEMO_API_TOKEN" \
  --read-only --tmpfs /tmp:size=16m \
  --cap-drop ALL --security-opt no-new-privileges:true \
  ghcr.io/abecms/abecms-demo:local
```

Omitting `-e ABE_DEMO_API_TOKEN` makes the container exit 1 with
`[abe-demo] startup aborted: ABE_DEMO_API_TOKEN is not set…`.

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
8. **Manage the token as a secret.** Inject `ABE_DEMO_API_TOKEN` from the
   platform's secret store (AWS Secrets Manager, SSM Parameter Store…), never
   from a committed file, a build argument or an image layer. Rotate it by
   rolling the gateway and the caller together; the gateway holds no state, so a
   rolling restart with the new value is enough.
9. **Never set `ABE_DEMO_ALLOW_UNAUTHENTICATED`** outside a developer laptop.
   Its presence in a deployment manifest should be treated as an incident.

## CI / publishing

`.github/workflows/demo-renderer.yml` runs unit tests, gateway tests and the
distribution build, then builds `ghcr.io/abecms/abecms-demo`. Images are pushed
to GHCR only on `push` to `master` / `update` and on `v*` tags; pull requests
build and smoke-test the image without pushing. The workflow default permission
is `contents: read`; `packages: write` is granted to the build job only.

The pull-request smoke test generates an ephemeral token with `openssl rand -hex
32`, masks it with `::add-mask::`, then asserts that `/health` answers without a
credential, that `/schema` and `/render` succeed with the token and return `401`
without it, that `/abe/users` returns `404` with and without a credential, and
that the container refuses to start when no token is configured.

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
