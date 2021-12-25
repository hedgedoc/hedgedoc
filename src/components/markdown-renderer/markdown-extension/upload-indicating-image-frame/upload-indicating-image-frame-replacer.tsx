/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer } from '../../replace-components/component-replacer'
import type { Element } from 'domhandler'
import { UploadIndicatingFrame } from './upload-indicating-frame'

const uploadIdRegex = /^upload-(.+)$/

/**
 * Replaces an image tag whose url is an upload-id with the {@link UploadIndicatingFrame upload indicating frame}.
 */
export class UploadIndicatingImageFrameReplacer extends ComponentReplacer {
  replace(node: Element): NodeReplacement {
    if (node.name === 'img' && uploadIdRegex.test(node.attribs.src)) {
      return <UploadIndicatingFrame width={node.attribs.width} height={node.attribs.height} />
    }
  }
}
