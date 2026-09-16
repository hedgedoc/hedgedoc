/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../common/icons/ui-icon'
import type { PropsWithChildren } from 'react'
import React, { useCallback, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { CaretDownFill as IconCaretDown } from 'react-bootstrap-icons'
import styles from './toolbar-menu.module.scss'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'

/**
 * Renders additional editor toolbar actions in a compact dropdown menu.
 */
export const ToolbarMenu: React.FC<PropsWithChildren> = ({ children }) => {
  const title = useTranslatedText('editor.editorToolbar.more')
  const [show, setShow] = useState(false)
  const hideMenu = useCallback(() => setShow(false), [])

  return (
    <Dropdown className={styles.dropdown} show={show} onToggle={setShow}>
      <Dropdown.Toggle variant={'outline-secondary'} className={styles.toggle} title={title} aria-label={title}>
        <UiIcon icon={IconCaretDown} />
      </Dropdown.Toggle>
      <Dropdown.Menu className={styles.menu} onClick={hideMenu}>
        <div className={styles.entries}>{children}</div>
      </Dropdown.Menu>
    </Dropdown>
  )
}
