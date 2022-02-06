#!/bin/bash

# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only

json=$(yarn netlify deploy --build --prod --json --message "${1:0:8}: $2")

echo "${json}"

url=$(echo "${json}" | jq -r .deploy_url)
logs=$(echo "${json}" | jq -r .logs)

echo "::set-output name=url::${url}"
echo "::set-output name=logs::${logs}"
