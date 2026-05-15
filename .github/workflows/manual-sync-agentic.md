---
description: |
  Manual agentic workflow for GitHub token permission testing.
  Reads docs/source.txt, updates docs/output.txt with a UTC timestamp,
  and attempts to open a pull request.

on:
  workflow_dispatch:
    inputs:
      target_repo:
        description: Optional owner/repo target. Leave empty to use current repository.
        required: false
        type: string
      base_branch:
        description: Base branch for the PR.
        required: false
        default: master
        type: string

timeout-minutes: 45

permissions: read-all

checkout:
  fetch: ["*"]
  fetch-depth: 0

network:
  allowed:
  - defaults
  - node

tools:
  github:
    toolsets: [all]
    min-integrity: none
  bash: true

safe-outputs:
  messages:
    run-started: "{workflow_name} started token permission test: {event_type}"
    run-success: "{workflow_name} completed token permission test successfully."
    run-failure: "{workflow_name} failed token permission test with status {status}."
  create-pull-request:
    title-prefix: "[Token Test] "
    labels: [automation]
    draft: true
    max: 1
    protected-files: fallback-to-issue
  create-issue:
    title-prefix: "[Token Test] "
    labels: [automation]
    max: 1
  noop:
    max: 1
---

# Manual Sync Agentic

You are running a token permission test workflow.

## Inputs

- target_repo: `${{ github.event.inputs.target_repo }}`
- base_branch: `${{ github.event.inputs.base_branch }}`

Interpretation rules:

1. If target_repo is empty, use `${{ github.repository }}`.
2. If base_branch is empty, use `master`.

## Objective

Test whether the workflow runtime can perform a complete change-and-PR flow under current token permissions.

Required work:

1. Confirm `docs/source.txt` exists in the current checkout.
2. Update `docs/output.txt` so the first line is exactly:
   `last_updated: YYYY-MM-DD HH:MM:SS UTC`
   using the current UTC time.
3. Include a blank line after that line, then `Source snapshot:` and the full contents of `docs/source.txt`.
4. Create a new branch named:
   `automation/manual-sync-agentic-${{ github.run_id }}`
5. Commit only `docs/output.txt`.
6. Attempt to create a draft PR against `base_branch`.

PR requirements:

- Title: `Manual sync update for docs/output.txt`
- Body must include:
  - A line stating this is an automated token permission test.
  - The resolved target repo.
  - The resolved base branch.

## Failure handling for permission tests

If PR creation cannot be completed due to permission/access limitations:

1. Create one issue summarizing exactly which action failed (push, branch write, or PR create).
2. Include concrete error text in the issue body.
3. Call `noop` only if there is truly no safe output left to produce.

Do not make unrelated code changes.