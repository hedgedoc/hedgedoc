/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Returns the markdown line prefix for a task list checkbox.
 *
 * @param state The check state of the checkbox.
 */
export const createCheckboxContent = (state: boolean) => {
  return `[${state ? 'x' : ' '}]`
}
