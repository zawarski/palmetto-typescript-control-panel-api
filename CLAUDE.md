# CLAUDE.md - palmetto-typescript-control-panel-api

## Project Overview

- **Purpose:** palmetto-typescript-control-panel-api project.
- **Stack:** Node.js 24 (AWS Lambda), TypeScript 6.0, Serverless Framework 3.40 with serverless-esbuild, Middy 7, TypeORM 0.3 on Aurora MySQL (Data API), Jest 30

## Build & Run

- Install: `nvm use 24`, then `npm install` -- local Node must match the Lambda runtime (Node.js 24).

## Architecture

```
serverless.ts            -- Serverless service definition (provider, functions, plugins)
src/functions/           -- Lambda handlers per feature (applications, contacts, group_management); index.ts registers them
src/db/                  -- TypeORM data source config and entities
src/libs/                -- shared Lambda helpers (middy wrapper, API Gateway types, responses, handler resolver)
src/utils/               -- SQL filter helpers
src/interfaces/          -- shared TypeScript interfaces
src/scripts/             -- one-off maintenance scripts (audit-group-contact-drift)
scripts/                 -- build tooling (serverless-esbuild temp cleanup)
```

## Git & Commits

- **Development branch:** main
- **Production branch:** main
- **Branch strategy:** single-branch <!-- single-branch | trunk-prod | custom -- see .claude/docs/hf-ref-git-workflow.md#branch-strategy-enum -->
- **Branch naming:** `<type>/short-description` where type matches the commit type (`feat/`, `fix/`, `chore/`, `refactor/`).
- **Version/tag strategy:** <!-- e.g., semver tags on promotion, CalVer -- define per project -->
- **No Co-Authored-By trailer.** Omit the `Co-Authored-By: Claude ...` line from commit messages.

## Verification

1. `npm run lint` passes
2. `npm test` passes

## Project-Specific Notes

<!-- Add a rule when Claude makes a repeatable mistake: "RULE: description (added YYYY-MM-DD after incident)" -->

- Every `sls` command prints `Invalid configuration encountered at 'provider.runtime'` and a `CONFIG_VALIDATION_MODE_DEFAULT_V3` deprecation. Treat both as expected: Serverless v3's schema ends at `nodejs20.x`, so it does not recognise `nodejs24.x`, and package, offline and deploy proceed. They clear with the Serverless v4 migration; leave `configValidationMode` unset, because `error` fails every command and `off` hides real configuration errors.
