/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'
import { MermaidChart } from '../mermaid/mermaid-chart'
import { DeprecationWarning } from './deprecation-warning'

/**
 * Renders a sequence diagram with a deprecation notice.
 *
 * @param code the sequence diagram code
 */
export const SequenceDiagram: React.FC<CodeProps> = ({ code }) => {
  return (
    <Fragment>
      <DeprecationWarning />
      <MermaidChart code={'sequenceDiagram\n' + code} />
    </Fragment>
  )
}
