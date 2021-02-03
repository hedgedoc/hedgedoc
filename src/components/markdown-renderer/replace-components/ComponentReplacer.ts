/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import { ReactElement } from 'react'

export type SubNodeTransform = (node: DomElement, subIndex: number) => ReactElement | void | null

export type NativeRenderer = () => ReactElement

export type MarkdownItPlugin = MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions | MarkdownIt.PluginWithParams

export abstract class ComponentReplacer {
  public abstract getReplacement(node: DomElement, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): (ReactElement | null | undefined);
}
