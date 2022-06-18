#!/bin/bash
#
# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: AGPL-3.0-only
#

set -e
curl -o caddy "https://caddyserver.com/api/download?os=linux&arch=amd64"
chmod +x ./caddy
