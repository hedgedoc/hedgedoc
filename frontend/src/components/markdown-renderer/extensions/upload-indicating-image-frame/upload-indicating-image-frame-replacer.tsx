/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { UploadIndicatingFrame } from './upload-indicating-frame'
import type { Element } from 'domhandler'

const uploadIdRegex = /^upload-(.+)$/

/**
 * Replaces an image tag whose url is an upload-id with the {@link UploadIndicatingFrame upload indicating frame}.
 */
export class UploadIndicatingImageFrameReplacer extends ComponentReplacer {
  replace(node: Element): NodeReplacement {
    return node.name !== 'img' || !uploadIdRegex.test(node.attribs.src) ? (
      DO_NOT_REPLACE
    ) : (
      <UploadIndicatingFrame width={node.attribs.width} height={node.attribs.height} />
    )
  }
}
