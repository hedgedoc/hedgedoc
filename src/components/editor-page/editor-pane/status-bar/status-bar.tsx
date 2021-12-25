/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Position } from 'codemirror'
import React from 'react'
import styles from './status-bar.module.scss'
import { RemainingCharactersInfo } from './remaining-characters-info'
import { NumberOfLinesInDocumentInfo } from './number-of-lines-in-document-info'
import { CursorPositionInfo } from './cursor-position-info'
import { SelectionInfo } from './selection-info'
import { ShowIf } from '../../../common/show-if/show-if'
import { SeparatorDash } from './separator-dash'

export interface StatusBarInfo {
  position: Position
  selectedColumns: number
  selectedLines: number
  linesInDocument: number
  charactersInDocument: number
  remainingCharacters: number
}

export const defaultState: StatusBarInfo = {
  position: { line: 0, ch: 0 },
  selectedColumns: 0,
  selectedLines: 0,
  linesInDocument: 0,
  charactersInDocument: 0,
  remainingCharacters: 0
}

export interface StatusBarProps {
  statusBarInfo: StatusBarInfo
}

/**
 * Shows additional information about the document length and the current selection.
 *
 * @param statusBarInfo The information to show
 */
export const StatusBar: React.FC<StatusBarProps> = ({ statusBarInfo }) => {
  return (
    <div className={`d-flex flex-row ${styles['status-bar']} px-2`}>
      <div>
        <CursorPositionInfo cursorPosition={statusBarInfo.position} />
        <ShowIf condition={statusBarInfo.selectedLines === 1 && statusBarInfo.selectedColumns > 0}>
          <SeparatorDash />
          <SelectionInfo count={statusBarInfo.selectedColumns} translationKey={'column'} />
        </ShowIf>
        <ShowIf condition={statusBarInfo.selectedLines > 1}>
          <SeparatorDash />
          <SelectionInfo count={statusBarInfo.selectedLines} translationKey={'line'} />
        </ShowIf>
      </div>
      <div className='ml-auto'>
        <NumberOfLinesInDocumentInfo numberOfLinesInDocument={statusBarInfo.linesInDocument} />
        <SeparatorDash />
        <RemainingCharactersInfo
          remainingCharacters={statusBarInfo.remainingCharacters}
          charactersInDocument={statusBarInfo.charactersInDocument}
        />
      </div>
    </div>
  )
}
