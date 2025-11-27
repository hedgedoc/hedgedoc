#!/bin/sh
#
# SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e

echo "🦔 > Clear dist directory.."
rm -rf dist

echo "🦔 > Compile to CJS.."
tsc --project tsconfig.cjs.json

echo "🦔 > Fix CJS package.json.."
cat > dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

echo "🦔 > Done!"
