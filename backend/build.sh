#!/usr/bin/env bash
#
# SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#
set -euo pipefail

_script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${_script_dir}" || exit 1

if [ -d "dist" ]; then
  echo "🦔 > Clearing dist directory"
  rm -rf dist
fi

echo "🦔 > Building NestJS application"
nest build

if [ -d "dist/src/database/migrations" ]; then
  echo "🦔 > Removing TypeScript definitions from migrations folder"
  rm -rf dist/src/database/migrations/*.d.ts 2>/dev/null || true
  rm -rf dist/src/database/migrations/*.map 2>/dev/null || true
fi

echo "🦔 > Done building backend"
exit 0
