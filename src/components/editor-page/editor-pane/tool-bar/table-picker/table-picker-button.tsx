/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { Button, Overlay } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { TableSizePickerPopover } from './table-size-picker-popover'
import { CustomTableSizeModal } from './custom-table-size-modal'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'
import { ShowIf } from '../../../../common/show-if/show-if'
import { addTableAtCursor } from '../../../../../redux/note-details/methods'

enum PickerMode {
  INVISIBLE,
  GRID,
  CUSTOM
}

/**
 * Toggles the visibility of a table size picker overlay and inserts the result into the editor.
 */
export const TablePickerButton: React.FC = () => {
  const { t } = useTranslation()
  const [pickerMode, setPickerMode] = useState<PickerMode>(PickerMode.INVISIBLE)
  const onDismiss = useCallback(() => setPickerMode(PickerMode.INVISIBLE), [])
  const onShowModal = useCallback(() => setPickerMode(PickerMode.CUSTOM), [])

  const onSizeSelect = useCallback((rows: number, columns: number) => {
    addTableAtCursor(rows, columns)
    setPickerMode(PickerMode.INVISIBLE)
  }, [])

  const tableTitle = useMemo(() => t('editor.editorToolbar.table.titleWithoutSize'), [t])

  const button = useRef(null)

  const toggleOverlayVisibility = useCallback(
    () =>
      setPickerMode((oldPickerMode) =>
        oldPickerMode === PickerMode.INVISIBLE ? PickerMode.GRID : PickerMode.INVISIBLE
      ),
    []
  )

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
    ({ ref, ...popoverProps }) => (
      <TableSizePickerPopover
        onTableSizeSelected={onSizeSelect}
        onShowCustomSizeModal={onShowModal}
        onRefUpdate={ref}
        {...popoverProps}
      />
    ),
    [onShowModal, onSizeSelect]
  )

  return (
    <Fragment>
      <Button
        {...cypressId('table-size-picker-button')}
        variant='light'
        onClick={toggleOverlayVisibility}
        title={tableTitle}
        ref={button}>
        <ForkAwesomeIcon icon='table' />
      </Button>
      <Overlay
        target={button.current}
        onHide={onOverlayHide}
        show={pickerMode === PickerMode.GRID}
        placement={'bottom'}
        rootClose={true}>
        {createPopoverElement}
      </Overlay>
      <ShowIf condition={pickerMode === PickerMode.CUSTOM}>
        <CustomTableSizeModal
          showModal={pickerMode === PickerMode.CUSTOM}
          onDismiss={onDismiss}
          onSizeSelect={onSizeSelect}
        />
      </ShowIf>
    </Fragment>
  )
}
