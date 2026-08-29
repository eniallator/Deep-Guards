#!/usr/bin/env bash
set -euo pipefail

pnpm login
pnpm version minor --no-git-checks
pnpm release
