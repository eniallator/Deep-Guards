#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

try_pack() {
    local result
    result=$(pnpm pack --json 2>/dev/null) && echo "$result" && return 0
    result=$(npm pack --json 2>/dev/null) && echo "$result" && return 0
    result=$(corepack npm pack --json 2>/dev/null) && echo "$result" && return 0
    return 1
}

echo 'Packing package for inspection..'

pack_json=$(try_pack) || { echo "Failed to run npm pack."; exit 1; }

tarball_file=$(echo "$pack_json" | jq -r 'if type == "array" then .[0] else . end | .filename')
tarball="$PWD/$tarball_file"

echo "Created tarball: $tarball_file"

files=$(tar -tf "$tarball")

for expected in \
    'package/dist/index.js' \
    'package/dist/index.d.ts' \
    'package/package.json'; do
    if ! echo "$files" | grep -qxF "$expected"; then
        echo "Missing expected file: $expected"
        exit 1
    fi
done

pkg=$(tar -xOf "$tarball" package/package.json)

if ! echo "$pkg" | jq -e '.files | index("dist")' >/dev/null 2>&1; then
    echo 'package.json contains invalid package entry fields.'
    exit 1
fi

if [ "$(echo "$pkg" | jq -r '.main')" != 'dist/index.js' ]; then
    echo 'package.json contains invalid package entry fields.'
    exit 1
fi

if [ "$(echo "$pkg" | jq -r '.types')" != 'dist/index.d.ts' ]; then
    echo 'package.json contains invalid package entry fields.'
    exit 1
fi

echo 'Package output inspection passed.'

rm -f "$tarball"
