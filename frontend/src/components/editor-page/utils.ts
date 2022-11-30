/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isClientSideRendering } from '../../utils/is-client-side-rendering'

/**
 * Determines if the client is running on a Mac.
 * This is necessary to e.g. determine different keyboard shortcuts.
 */
export const isMac: () => boolean = () => isClientSideRendering() && navigator.platform.toLowerCase().includes('mac')
