/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Button, Form, ModalFooter } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { CommonModal } from '../../../../common/modals/common-modal'
import type { TableSize } from './table-picker'

export interface CustomTableSizeModalProps {
  showModal: boolean
  onDismiss: () => void
  onTablePicked: (row: number, cols: number) => void
}

export const CustomTableSizeModal: React.FC<CustomTableSizeModalProps> = ({ showModal, onDismiss, onTablePicked }) => {
  const { t } = useTranslation()
  const [tableSize, setTableSize] = useState<TableSize>({
    rows: 0,
    columns: 0
  })

  useEffect(() => {
    setTableSize({
      rows: 0,
      columns: 0
    })
  }, [showModal])

  const onClick = useCallback(() => {
    onTablePicked(tableSize.rows, tableSize.columns)
    onDismiss()
  }, [onDismiss, tableSize, onTablePicked])

  return (
    <CommonModal
      show={showModal}
      onHide={() => onDismiss()}
      titleI18nKey={'editor.editorToolbar.table.customSize'}
      closeButton={true}
      icon={'table'}>
      <div className={'col-lg-10 d-flex flex-row p-3 align-items-center'}>
        <Form.Control
          type={'number'}
          min={1}
          placeholder={t('editor.editorToolbar.table.cols')}
          isInvalid={tableSize.columns <= 0}
          onChange={(event) => {
            const value = Number.parseInt(event.currentTarget.value)
            setTableSize((old) => ({
              rows: old.rows,
              columns: isNaN(value) ? 0 : value
            }))
          }}
        />
        <ForkAwesomeIcon icon='times' className='mx-2' fixedWidth={true} />
        <Form.Control
          type={'number'}
          min={1}
          placeholder={t('editor.editorToolbar.table.rows')}
          isInvalid={tableSize.rows <= 0}
          onChange={(event) => {
            const value = Number.parseInt(event.currentTarget.value)
            setTableSize((old) => ({
              rows: isNaN(value) ? 0 : value,
              columns: old.columns
            }))
          }}
        />
      </div>
      <ModalFooter>
        <Button onClick={onClick} disabled={tableSize.rows <= 0 || tableSize.columns <= 0}>
          {t('editor.editorToolbar.table.create')}
        </Button>
      </ModalFooter>
    </CommonModal>
  )
}
