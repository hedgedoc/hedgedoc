/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppExtension } from './_base-classes/app-extension'
import { essentialAppExtensions } from './essential-app-extensions/essential-app-extensions'
import { externalLibAppExtensions } from './external-lib-app-extensions/external-lib-app-extensions'

export const allAppExtensions: AppExtension[] = [...essentialAppExtensions, ...externalLibAppExtensions]
