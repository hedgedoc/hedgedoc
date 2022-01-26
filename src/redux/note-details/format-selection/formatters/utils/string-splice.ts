/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Modifies a string by inserting another string and/or deleting characters.
 *
 * @param text Text to modify
 * @param changePosition The position where the other text should be inserted and characters should be deleted
 * @param textToInsert The text to insert
 * @param deleteLength The number of characters to delete
 * @return The modified string
 */
export const stringSplice = (
  text: string,
  changePosition: number,
  textToInsert: string,
  deleteLength?: number
): string => {
  const correctedDeleteLength = deleteLength === undefined || deleteLength < 0 ? 0 : deleteLength
  return text.slice(0, changePosition) + textToInsert + text.slice(changePosition + correctedDeleteLength)
}
