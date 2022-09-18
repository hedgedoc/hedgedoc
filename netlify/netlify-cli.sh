#!/bin/bash

#
# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

NETLIFY_VERSION=11.8.0
exec npx --yes netlify-cli@${NETLIFY_VERSION} $@
