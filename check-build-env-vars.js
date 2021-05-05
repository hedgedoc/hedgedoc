/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

if (!process.env.REACT_APP_BACKEND_BASE_URL) {
  console.error("==============\nREACT_APP_BACKEND_BASE_URL not set.\n  Use this task only if you want to create a production build with a real backend. Otherwise use build:mock\n==============");
  process.exit(1);
}
