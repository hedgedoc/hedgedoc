/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import CodeMirror from 'codemirror'
import React, { Fragment, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { addTable } from '../utils/toolbarButtonUtils'
import { TablePicker } from './table-picker'

export interface TablePickerButtonProps {
  editor: CodeMirror.Editor
}

export const TablePickerButton: React.FC<TablePickerButtonProps> = ({ editor }) => {
  const { t } = useTranslation()
  const [showTablePicker, setShowTablePicker] = useState(false)

  return (
    <Fragment>
      <TablePicker
        show={showTablePicker}
        onDismiss={() => setShowTablePicker(false)}
        onTablePicked={(rows, cols) => {
          setShowTablePicker(false)
          addTable(editor, rows, cols)
        }}
      />
      <Button data-cy={'show-table-overlay'} variant='light' onClick={() => setShowTablePicker(old => !old)} title={t('editor.editorToolbar.table.title')}>
        <ForkAwesomeIcon icon="table"/>
      </Button>
    </Fragment>
  )
}
