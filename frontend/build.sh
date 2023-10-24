#!/bin/sh
#
# SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e

cleanup () {
    if [ -d ../tmp/src/pages/api ]; then
        echo "🦔 > Moving Mock API files back"
        mv ../tmp/src/pages/api src/pages
    fi
}

trap cleanup EXIT

echo "🦔 Frontend Production Build"
echo "🦔 > Clearing existing builds"
rm -rf dist/

echo "🦔 > Preparing files"
if [ ! -z "${NEXT_PUBLIC_USE_MOCK_API}" ]; then
    echo "🦔 > Keeping Mock API because NEXT_PUBLIC_USE_MOCK_API is set"
    if [ ! -d src/pages/api ]; then
        echo "🦔 > ⚠️ src/pages/api doesn't exist"
    fi
else
    echo "🦔 > Moving Mock API because NEXT_PUBLIC_USE_MOCK_API is unset"
    mkdir -p ../tmp/src/pages
    mv src/pages/api ../tmp/src/pages/
fi

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
