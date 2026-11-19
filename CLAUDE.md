# CLAUDE.md - palmetto-typescript-control-panel-api

## Project Overview

- **Purpose:** palmetto-typescript-control-panel-api project.
- **Stack:** Node.js 20 (AWS Lambda), TypeScript 5.8, Serverless Framework 3.40 with serverless-esbuild, Middy 6, TypeORM 0.3 on Aurora MySQL (Data API), Jest 29

## Build & Run

- Install: `npm install`

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
