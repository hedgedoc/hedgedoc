/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ShortRealtimeUser } from '../message-transporters/realtime-user.js'
import type { AbsolutePosition, RelativePosition } from 'yjs'

export type RelativePositionAuthorship = [RelativePosition, ShortRealtimeUser]
export type OptionalAbsolutePositionAuthorship = [AbsolutePosition | null, ShortRealtimeUser]
export type AbsolutePositionAuthorship = [number, ShortRealtimeUser]

export interface AbsoluteRangeAuthorship {
  from: number
  to: number
  user: ShortRealtimeUser
}

/**
 * Converts a list of absolute authorship position start points into authorship range objects with defined start and end.
 * This works by zipping together each two pairs in the list of start points.
 *
 * @param absolutePositions The list of absolute positions, containing each a user attribution
 * @param docLength The total document length, in order to determine the last element's end
 * @returns A list of range objects including the user attribution
 */
export const convertAbsolutePositionAuthorshipsToRanges = (
  absolutePositions: AbsolutePositionAuthorship[],
  docLength: number,
): AbsoluteRangeAuthorship[] => {
  const zipped = Array.from(Array(absolutePositions.length), (_, i) => [
    absolutePositions[i],
    i < absolutePositions.length - 1 ? absolutePositions[i + 1] : absolutePositions[i],
  ])
  return zipped.map(([[from, user], [to, _]]) => ({
    from,
    to: to !== from ? to : docLength,
    user,
  }))
}
