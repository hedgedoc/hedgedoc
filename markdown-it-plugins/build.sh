#!/bin/bash
#
# SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: MIT
#


set -e

echo "Clear dist directory.."
rm -rf dist

echo "Compile to CJS.."
tsc --project tsconfig.cjs.json

echo "Compile to ESM.."
tsc --project tsconfig.esm.json

echo "Fix CJS package.json.."
cat > dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

echo "Fix ESM package.json.."
cat > dist/esm/package.json <<!EOF
{
    "type": "module"
}
!EOF

echo "Done!"
