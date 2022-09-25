<!--
SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

To use backend and frontend together you need a reverse proxy that combines both services under one URL origin.

We provide a ready to use config for caddy.
Make sure that the backend is running on port 3000 with the env var HD_DOMAIN set to `http://localhost:8080` and the frontend is running on port 3001 with the env var HD_EDITOR_BASE_URL set to `http://localhost:8080/`.

You can either use the script `run-caddy.sh` in this directory or download a caddy binary from [caddy](https://caddyserver.com/) and start it using `caddy run`.
