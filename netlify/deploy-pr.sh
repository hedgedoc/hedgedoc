#!/bin/bash

#
# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

json=$($(dirname "$0")/netlify-cli.sh deploy --build --context deploy-preview --alias "$1" --json --message "[#$1] $2")

if [ $? -ne 0 ]; then
    echo "Error while executing netlify! Will try again without json..."
    $(dirname "$0")/netlify-cli.sh deploy --build --context deploy-preview --alias "$1" --message "[#$1] $2"
    exit 1
fi

echo "${json}"

url=$(echo "${json}" | jq -r .deploy_url)
logs=$(echo "${json}" | jq -r .logs)

echo "::set-output name=url::${url}"
echo "::set-output name=logs::${logs}"
