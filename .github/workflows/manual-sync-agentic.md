---
description: |
  Manual agentic workflow for GitHub token permission testing.
  Pulls a source file from one repository, updates a target file,
  and attempts to open a pull request in the target repository.

on:
  workflow_dispatch:
    inputs:
      source_repo:
        description: Optional owner/repo source. Leave empty to read from target_repo.
        required: false
        type: string
      source_path:
        description: File path to read from source_repo.
        required: false
        default: source.txt
        type: string
      target_repo:
        description: Optional owner/repo target. Leave empty to use current repository.
        required: false
        type: string
      target_path:
        description: File path to update in target_repo.
        required: false
        default: source.txt
        type: string
      base_branch:
        description: Base branch for the PR.
        required: false
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
  github-token: ${{ secrets.GH_AW_GITHUB_TOKEN }}
  messages:
    run-started: "{workflow_name} started token permission test: {event_type}"
    run-success: "{workflow_name} completed token permission test successfully."
    run-failure: "{workflow_name} failed token permission test with status {status}."
  create-pull-request:
    title-prefix: "[Token Test] "
    labels: [automation]
    draft: true
    allowed-repos: [harrywat/bubblescan, harrywat/network-things]
    max: 1
    protected-files: fallback-to-issue
    token: ${{ secrets.GITHUB_TOKEN || github.token }}
  create-issue:
    title-prefix: "[Token Test] "
    labels: [automation]
    allowed-repos: [harrywat/bubblescan, harrywat/network-things]
    max: 1
    token: ${{ secrets.GITHUB_TOKEN || github.token }}
  noop:
    max: 1
---

# Manual Sync Agentic

You are running a token permission test workflow.

## Inputs

- source_repo: `${{ github.event.inputs.source_repo }}`
- source_path: `${{ github.event.inputs.source_path }}`
- target_repo: `${{ github.event.inputs.target_repo }}`
- target_path: `${{ github.event.inputs.target_path }}`
- base_branch: `${{ github.event.inputs.base_branch }}`

Interpretation rules:

1. If target_repo is empty, use `${{ github.repository }}`.
2. If source_repo is empty, use resolved target_repo.
3. If source_path is empty, use `source.txt`.
4. If target_path is empty, use `source.txt`.
5. If base_branch is empty, use `${{ github.event.repository.default_branch }}`.
6. If the workflow is run from a non-default branch during testing, set `base_branch` explicitly to that branch name.

## Objective

Test whether the workflow runtime can perform a complete cross-repository read and PR flow under current token permissions.

## Runtime token bootstrap

Before running preflight checks, ensure the runtime has a `GITHUB_TOKEN` environment variable set for multi-repo checkout/push operations.

1. If `GITHUB_TOKEN` is unset but `GH_TOKEN` is available, set `GITHUB_TOKEN` to `GH_TOKEN` for the current process.
2. If neither token is available, stop and create an issue explaining that `GITHUB_TOKEN` is required for dynamic multi-repo checkout.
3. Include the exact token-missing error text in the issue body.

## Preflight checks (must run before any edits)

1. Verify read access to source_repo by fetching source_path.
2. Verify target_repo exists and base_branch is resolvable in target_repo.
3. Verify write capability for target_repo pull-request flow by confirming branch and PR operations are permitted.
4. If any preflight check fails, stop mutation work and follow the failure handling section with exact error text.

Required work:

1. Resolve source_repo, source_path, target_repo, target_path, and base_branch using the interpretation rules.
2. Run all preflight checks and only continue if they pass.
3. Read the full contents of source_path from source_repo at the resolved base_branch. If that branch does not exist in source_repo, fall back to source_repo default branch.
4. Ensure the local checkout is moved to the resolved base_branch tip before any file edits.
5. Create a new work branch named `automation/manual-sync-agentic-${{ github.run_id }}` from that resolved base commit.
6. Update target_path so the first line is exactly:
  `last_updated: YYYY-MM-DD HH:MM:SS UTC`
  using the current UTC time.
7. Include a blank line after that line, then `Source snapshot:` and the full source file contents from source_repo/source_path.
8. Commit only target_path.
9. Attempt to create a draft PR against target_repo and base_branch.

Branch safety requirements:

1. Never create the work branch from the triggering branch unless it is exactly the resolved `base_branch`.
2. Never include commits or file diffs from unrelated branches in the PR bundle.

PR requirements:

- Title: `Manual sync update for ${target_path}`
- Body must include:
  - A line stating this is an automated token permission test.
  - The resolved source repo and source path.
  - The resolved target repo.
  - The resolved target path.
  - The resolved base branch.

## Failure handling for permission tests

If PR creation cannot be completed due to permission/access limitations:

1. Create one issue summarizing exactly which action failed (push, branch write, or PR create).
2. Include concrete error text in the issue body.
3. Call `noop` only if there is truly no safe output left to produce.

Do not make unrelated code changes.