#!/bin/bash
#
# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e

if [ ! -f caddy ]
then
curl -o caddy "https://caddyserver.com/api/download"
chmod +x ./caddy
fi

exec ./caddy run
