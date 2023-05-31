/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { replaceSelection } from '../formatters/replace-selection'
import { ToolbarButton } from '../toolbar-button'
import { createMarkdownTable } from './create-markdown-table'
import { CustomTableSizeModal } from './custom-table-size-modal'
import './table-picker.module.scss'
import { TableSizePickerPopover } from './table-size-picker-popover'
import React, { Fragment, useCallback, useRef, useState } from 'react'
import { Overlay } from 'react-bootstrap'
import { Table as IconTable } from 'react-bootstrap-icons'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'

enum PickerMode {
  INVISIBLE,
  GRID,
  CUSTOM
}

/**
 * Toggles the visibility of a table size picker overlay and inserts the result into the editor.
 */
export const TablePickerButton: React.FC = () => {
  const [pickerMode, setPickerMode] = useState<PickerMode>(PickerMode.INVISIBLE)
  const onDismiss = useCallback(() => setPickerMode(PickerMode.INVISIBLE), [])
  const onShowModal = useCallback(() => setPickerMode(PickerMode.CUSTOM), [])
  const changeEditorContent = useChangeEditorContentCallback()

  const onSizeSelect = useCallback(
    (rows: number, columns: number) => {
      const table = createMarkdownTable(rows, columns)
      changeEditorContent?.(({ currentSelection }) => replaceSelection(currentSelection, table, true))
      setPickerMode(PickerMode.INVISIBLE)
    },
    [changeEditorContent]
  )

  const button = useRef(null)
  const toggleOverlayVisibility = useCallback(() => {
    setPickerMode((oldPickerMode) => (oldPickerMode === PickerMode.INVISIBLE ? PickerMode.GRID : PickerMode.INVISIBLE))
  }, [])

  const onOverlayHide = useCallback(() => {
    setPickerMode((oldMode) => {
      if (oldMode === PickerMode.CUSTOM) {
        return PickerMode.CUSTOM
      } else {
        return PickerMode.INVISIBLE
      }
    })
  }, [])

  const createPopoverElement = useCallback<(props: OverlayInjectedProps) => React.ReactElement>(
    (popoverProps) => (
      <TableSizePickerPopover
        onTableSizeSelected={onSizeSelect}
        onShowCustomSizeModal={onShowModal}
        {...popoverProps}
      />
    ),
    [onShowModal, onSizeSelect]
  )

  return (
    <Fragment>
      <ToolbarButton
        i18nKey={'table.titleWithoutSize'}
        icon={IconTable}
        onClick={toggleOverlayVisibility}
        buttonRef={button}
      />
      <Overlay
        target={button.current}
        onHide={onOverlayHide}
        show={pickerMode === PickerMode.GRID}
        placement={'auto'}
        flip={true}
        offset={[0, 0]}
        rootClose={pickerMode === PickerMode.GRID}>
        {createPopoverElement}
      </Overlay>
      <CustomTableSizeModal
        showModal={pickerMode === PickerMode.CUSTOM}
        onDismiss={onDismiss}
        onSizeSelect={onSizeSelect}
      />
    </Fragment>
  )
}
