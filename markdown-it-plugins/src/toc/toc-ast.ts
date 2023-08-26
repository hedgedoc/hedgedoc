/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

export interface TocAst {
  level: number
  name: string
  children: TocAst[]
}
