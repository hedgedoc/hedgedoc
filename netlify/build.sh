#!/bin/bash

# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only

if [[ -z "${GITHUB_ACTIONS}" ]]; then
    echo "Running in netlify CI or manual"
    exec yarn build:netlify
else
    echo "Running in GitHub actions CI"
    echo "Build is not necessary as already done prior to this step."
fi
