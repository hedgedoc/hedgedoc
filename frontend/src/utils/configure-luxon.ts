/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Settings } from 'luxon'

export const configureLuxon = () => {
  Settings.throwOnInvalid = true
}

declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true
  }
}
