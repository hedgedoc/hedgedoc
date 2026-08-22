#!/bin/sh
#
# SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ -d "dist" ]; then
  echo "🦔 > Clearing dist directory"
  rm -rf dist
fi

echo "🦔 > Building NestJS application"
nest build

echo "🦔 > Marking production build as CommonJS"
cp src/database/migrations/package.json dist/package.json
cp src/database/migrations/package.json dist/src/database/migrations/package.json

if [ -d "dist/src/database/migrations" ]; then
  echo "🦔 > Removing TypeScript definitions from migrations folder"
  rm -f dist/src/database/migrations/*.d.ts 2>/dev/null || true
  rm -f dist/src/database/migrations/*.map 2>/dev/null || true
fi

echo "🦔 > Done building backend"
exit 0
