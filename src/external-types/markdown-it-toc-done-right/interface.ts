/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface TocOptions {
    placeholder: string
    slugify: (s: string) => string
    containerClass: string
    containerId: string
    listClass: string
    itemClass: string
    linkClass: string
    level: number | number[]
    listType: 'ol' | 'ul'
    format: (s: string) => string
    callback: (tocCode: string, ast: TocAst) => void
}

export interface TocAst {
    l: number
    n: string
    c: TocAst[]
}
