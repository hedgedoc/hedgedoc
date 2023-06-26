/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { UiIcon } from '../../../../common/icons/ui-icon'
import { CommonModal } from '../../../../common/modals/common-modal'
import type { TableSize } from './table-size-picker-popover'
import type { ChangeEvent } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Form, ModalFooter } from 'react-bootstrap'
import { Table as IconTable, X as IconX } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

export interface CustomTableSizeModalProps {
  showModal: boolean
  onDismiss: () => void
  onSizeSelect: (row: number, cols: number) => void
}

const initialTableSize: TableSize = {
  rows: 0,
  columns: 0
}

/**
 * A modal that lets the user select a custom table size.
 *
 * @param showModal defines if the modal should be visible or not
 * @param onDismiss is called if the modal should be hidden without a selection
 * @param onSizeSelect is called if the user entered and confirmed a custom table size
 */
export const CustomTableSizeModal: React.FC<CustomTableSizeModalProps> = ({ showModal, onDismiss, onSizeSelect }) => {
  const [tableSize, setTableSize] = useState<TableSize>(() => initialTableSize)

  useEffect(() => {
    if (showModal) {
      setTableSize(initialTableSize)
    }
  }, [showModal])

  const onClick = useCallback(() => {
    onSizeSelect(tableSize.rows, tableSize.columns)
    onDismiss()
  }, [onDismiss, tableSize, onSizeSelect])

  const onColChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value)
    setTableSize((old) => ({
      rows: old.rows,
      columns: isNaN(value) ? 0 : value
    }))
  }, [])

  const onRowChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.currentTarget.value)
    setTableSize((old) => ({
      rows: isNaN(value) ? 0 : value,
      columns: old.columns
    }))
  }, [])

  const columnPlaceholderText = useTranslatedText('editor.editorToolbar.table.cols')
  const rowsPlaceholderText = useTranslatedText('editor.editorToolbar.table.rows')

  return (
    <CommonModal
      show={showModal}
      onHide={onDismiss}
      titleI18nKey={'editor.editorToolbar.table.customSize'}
      showCloseButton={true}
      titleIcon={IconTable}
      {...cypressId('custom-table-size-modal')}>
      <div className={'col-lg-10 d-flex flex-row p-3 align-items-center'}>
        <Form.Control
          type={'number'}
          min={1}
          placeholder={columnPlaceholderText}
          isInvalid={tableSize.columns <= 0}
          onChange={onColChange}
        />
        <UiIcon icon={IconX} className='mx-2' />
        <Form.Control
          type={'number'}
          min={1}
          placeholder={rowsPlaceholderText}
          isInvalid={tableSize.rows <= 0}
          onChange={onRowChange}
        />
      </div>
      <ModalFooter>
        <Button onClick={onClick} disabled={tableSize.rows <= 0 || tableSize.columns <= 0}>
          <Trans i18nKey={'editor.editorToolbar.table.create'} />
        </Button>
      </ModalFooter>
    </CommonModal>
  )
}
