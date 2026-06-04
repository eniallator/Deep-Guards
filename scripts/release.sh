#!/usr/bin/env bash
set -euo pipefail

yarn prepublish
yarn publish --access=public

VERSION=$(node -p "require('./package.json').version")

git add .
git commit -m "Release $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"
git push --no-verify
git push --tags --no-verify