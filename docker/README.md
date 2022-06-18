<!--
SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

To use backend and frontend together you need a reverse proxy that combines both services under one origin.

We provide a ready to use config for nginx and caddy.
Make sure that in the backend HD_DOMAIN is set to `http://localhost:8080`.

If you have docker you can use our docker-compose file that starts a nginx using `docker-compose up`.
If you're on Windows or macOS you rather might want to download [caddy](https://caddyserver.com/) and start it using `caddy run` in this directory.
