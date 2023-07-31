/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isAppleDevice } from '../../../utils/is-apple-device'
import React from 'react'

/**
 * Renders a keyboard alt/option key hint depending on if the browser is running on macOS or not.
 */
export const AltKey: React.FC = () => {
  return isAppleDevice() ? <kbd>⌥</kbd> : <kbd>Alt</kbd>
}
