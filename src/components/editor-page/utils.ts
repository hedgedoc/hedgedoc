/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isClientSideRendering } from '../../utils/is-client-side-rendering'

export const isMac: () => boolean = () => isClientSideRendering() && navigator.platform.toLowerCase().includes('mac')
