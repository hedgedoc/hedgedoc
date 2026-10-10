/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styles from './aliases-list-alias-entry.module.css'
import { useCopyOverlay } from '../../../../../common/copyable/hooks/use-copy-overlay'
import { Fragment, useRef } from 'react'

export interface AliasesListAliasEntryInterface {
  alias: string
}

export const AliasesListAliasEntry: React.FC<AliasesListAliasEntryInterface> = ({
  alias
}) => {
  const div = useRef<HTMLDivElement>(null)
  const [copyToClipboard, overlayElement] = useCopyOverlay(div, alias)

  return (
    <Fragment>
      <div
        role="listitem"
        className={styles['alias-container']}
        ref={div}
        onClick={copyToClipboard}
        onKeyDown={copyToClipboard}
      >
        <div className={styles['alias-text']} title={alias}>
          {alias}
        </div>
      </div>
      {overlayElement}
    </Fragment>
  )
}
