/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CursorPositionInfo } from './cursor-position-info'
import { NumberOfLinesInDocumentInfo } from './number-of-lines-in-document-info'
import { RemainingCharactersInfo } from './remaining-characters-info'
import { SelectedCharacters } from './selected-characters'
import { SelectedLines } from './selected-lines'
import { SeparatorDash } from './separator-dash'
import React from 'react'

/**
 * Shows additional information about the document length and the current selection.
 */
export const StatusBar: React.FC = () => {
  return (
    <div className={`d-flex flex-row border-secondary border-top small px-2`}>
      <div>
        <CursorPositionInfo />
        <SelectedCharacters />
        <SelectedLines />
      </div>
      <div className='ms-auto'>
        <NumberOfLinesInDocumentInfo />
        <SeparatorDash />
        <RemainingCharactersInfo />
      </div>
    </div>
  )
}
