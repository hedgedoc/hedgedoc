#!/bin/bash
#
# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e

echo 'Patch intro.md to include netlify banner.'
cp netlify/intro.md public/public/intro.md
echo 'Patch motd.md to include privacy policy.'
cp netlify/motd.md public/public/motd.md
echo 'Patch version.json to include git hash'
jq ".version = \"0.0.0+${GITHUB_SHA:0:8}\"" src/version.json > src/_version.json
mv src/_version.json src/version.json
echo "Patch base URL"
echo HD_EDITOR_BASE_URL="${1}" >> .env.production
