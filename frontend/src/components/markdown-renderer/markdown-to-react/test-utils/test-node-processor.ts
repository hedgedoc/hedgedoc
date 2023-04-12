/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NodeProcessor } from '../../node-preprocessors/node-processor'
import type { Document } from 'domhandler'
import { Element, Text } from 'domhandler'

export class TestNodeProcessor extends NodeProcessor {
  process(document: Document): Document {
    document.childNodes.push(new Element('node-processor', {}, [new Text('node processor children')]))
    return document
  }
}
