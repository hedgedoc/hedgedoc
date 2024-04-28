/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ShortRealtimeUser } from '../message-transporters/index.js'
import { AbsolutePosition, RelativePosition } from 'yjs'

export type RelativePositionAuthorship = [RelativePosition, ShortRealtimeUser]
export type OptionalAbsolutePositionAuthorship = [
  AbsolutePosition | null,
  ShortRealtimeUser
]
export type AbsolutePositionAuthorship = [number, ShortRealtimeUser]
