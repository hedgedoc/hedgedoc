/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { MermaidChart } from '../mermaid/mermaid-chart'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'

/**
 * Renders a sequence diagram with a deprecation notice.
 *
 * @param code the sequence diagram code
 */
export const SequenceDiagram: React.FC<CodeProps> = ({ code }) => {
  return <MermaidChart code={'sequenceDiagram\n' + code} />
}
