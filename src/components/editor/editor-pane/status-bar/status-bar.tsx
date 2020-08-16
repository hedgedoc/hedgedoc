import { Editor, Position } from 'codemirror'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import './status-bar.scss'

export interface StatusBarInfo {
  position: Position
  selectedColumns: number
  selectedLines: number
  linesInDocument: number
  charactersInDocument: number
}

export const defaultState: StatusBarInfo = {
  position: { line: 0, ch: 0 },
  selectedColumns: 0,
  selectedLines: 0,
  linesInDocument: 0,
  charactersInDocument: 0
}

export const createStatusInfo = (editor: Editor): StatusBarInfo => ({
  position: editor.getCursor(),
  charactersInDocument: editor.getValue().length,
  linesInDocument: editor.lineCount(),
  selectedColumns: editor.getSelection().length,
  selectedLines: editor.getSelection().split('\n').length
})

export const StatusBar: React.FC<StatusBarInfo> = ({ position, selectedColumns, selectedLines, charactersInDocument, linesInDocument }) => {
  const { t } = useTranslation()

  return (
    <div className="d-flex flex-row status-bar px-2">
      <div>
        <span>{t('editor.statusBar.cursor', { line: position.line + 1, columns: position.ch + 1 })}</span>
        <ShowIf condition={selectedColumns !== 0 && selectedLines !== 0}>
          <ShowIf condition={selectedLines === 1}>
            <span>&nbsp;–&nbsp;{t('editor.statusBar.selection.column', { count: selectedColumns })}</span>
          </ShowIf>
          <ShowIf condition={selectedLines > 1}>
            <span>&nbsp;–&nbsp;{t('editor.statusBar.selection.line', { count: selectedLines })}</span>
          </ShowIf>
        </ShowIf>
      </div>
      <div className="ml-auto">
        <span>{t('editor.statusBar.lines', { lines: linesInDocument })}</span>
        <span title={t('editor.statusBar.lengthTooltip')}>&nbsp;–&nbsp;{t('editor.statusBar.length', { length: charactersInDocument })}</span>
      </div>
    </div>
  )
}
