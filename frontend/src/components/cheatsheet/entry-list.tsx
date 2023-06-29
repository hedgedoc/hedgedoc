/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from './cheatsheet-extension'
import styles from './cheatsheet.module.scss'
import React, { useMemo } from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

interface CheatsheetListProps {
  selectedEntry: CheatsheetExtension | undefined
  extensions: CheatsheetExtension[]
  onStateChange: (value: CheatsheetExtension) => void
}

const compareString = (value1: string, value2: string): -1 | 0 | 1 => {
  return value1 === value2 ? 0 : value1 < value2 ? -1 : 1
}

/**
 * Renders a list of cheatsheet entries.
 *
 * @param extensions The extensions whose cheatsheet entries should be listed
 * @param selectedEntry The cheatsheet entry that should be rendered as selected.
 * @param onStateChange A callback that is executed when a new entry has been selected
 */
export const EntryList: React.FC<CheatsheetListProps> = ({ extensions, selectedEntry, onStateChange }) => {
  const { t } = useTranslation()

  const listItems = useMemo(
    () =>
      extensions
        .map((extension) => [extension, t(`cheatsheet.${extension.i18nKey}.title`)] as [CheatsheetExtension, string])
        .sort(([, title1], [, title2]) => compareString(title1.toLowerCase(), title2.toLowerCase()))
        .map(([cheatsheetExtension, title]) => (
          <ListGroupItem
            key={cheatsheetExtension.i18nKey}
            action
            active={cheatsheetExtension.i18nKey == selectedEntry?.i18nKey}
            onClick={() => onStateChange(cheatsheetExtension)}>
            {title}
          </ListGroupItem>
        )),
    [extensions, onStateChange, selectedEntry, t]
  )

  return <ListGroup className={styles.sticky}>{listItems}</ListGroup>
}
