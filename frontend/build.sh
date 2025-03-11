#!/bin/sh
#
# SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e

echo "🦔 Frontend Production Build"
echo "🦔 > Clearing existing builds"
rm -rf dist/

echo "🦔 > Building"
BUILD_TIME=true next build

echo "🦔 > Bundling"
mv .next/standalone dist
mkdir -p dist/frontend/.next
cp -R .next/static dist/frontend/.next/static
cp next.config.js dist/frontend/next.config.js
cp -R public dist/frontend/public
rm -f dist/frontend/.env

if [ "${NODE_ENV}" = "production" ]; then
    echo "🦔 > Remove public directory because this is a production build"
    rm -rf dist/frontend/public/public
fi

rm -rf dist/frontend/src

echo "🦔 > Done! You can run the build by going into the dist directory and executing \`node frontend/server.js\`"
