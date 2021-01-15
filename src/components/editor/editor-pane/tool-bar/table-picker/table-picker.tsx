/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { createNumberRangeArray } from '../../../../common/number-range/number-range'
import { CustomTableSizeModal } from './custom-table-size-modal'
import './table-picker.scss'

export interface TablePickerProps {
  show: boolean
  onDismiss: () => void
  onTablePicked: (row: number, cols: number) => void
}

export type TableSize = {
  rows: number,
  columns: number
}

export const TablePicker: React.FC<TablePickerProps> = ({ show, onDismiss, onTablePicked }) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [tableSize, setTableSize] = useState<TableSize>()
  const [showDialog, setShowDialog] = useState(false)

  useClickAway(containerRef, () => {
    onDismiss()
  })

  useEffect(() => {
    setTableSize(undefined)
  }, [show])

  const onClick = useCallback(() => {
    if (tableSize) {
      onTablePicked(tableSize.rows, tableSize.columns)
    }
  }, [onTablePicked, tableSize])

  return (
    <div className={`position-absolute table-picker-container p-2 ${!show || showDialog ? 'd-none' : ''} bg-light`} ref={containerRef} role="grid">
      <p className={'lead'}>
        { tableSize
          ? t('editor.editorToolbar.table.size', { cols: tableSize?.columns, rows: tableSize.rows })
          : t('editor.editorToolbar.table.title')
        }
      </p>
      <div className={'table-container'}>
        {createNumberRangeArray(8).map((row: number) => (
          createNumberRangeArray(10).map((col: number) => (
            <div
              key={`${row}_${col}`}
              className={`table-cell ${tableSize && row < tableSize.rows && col < tableSize.columns ? 'bg-primary' : ''}`}
              onMouseEnter={() => {
                setTableSize({
                  rows: row + 1,
                  columns: col + 1
                })
              }}
              title={t('editor.editorToolbar.table.size', { cols: col + 1, rows: row + 1 })}
              onClick={onClick}
            />
          )
          )
        ))}
      </div>
      <div className="d-flex justify-content-center mt-2">
        <Button data-cy={'show-custom-table-modal'} className={'text-center'} onClick={() => setShowDialog(true)}>
          <ForkAwesomeIcon icon="table"/>&nbsp;{t('editor.editorToolbar.table.customSize')}
        </Button>
        <CustomTableSizeModal
          showModal={showDialog}
          onDismiss={() => setShowDialog(false)}
          onTablePicked={onTablePicked}
        />
      </div>
    </div>
  )
}
