#!/bin/bash

# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only

deployid="$1-$2"

json=$(yarn netlify deploy --build --context deploy-preview --alias "${deployid}" --json --message "[#$1] $3")

url=$(echo "${json}" | jq -r .deploy_url)
logs=$(echo "${json}" | jq -r .logs)

echo "::set-output name=url::${url}"
echo "::set-output name=logs::${logs}"
