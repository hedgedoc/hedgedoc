/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import { useCallback } from 'react'
import React, { Fragment } from 'react'
import { BaseAppBar } from '../../../../../components/layout/app-bar/base-app-bar'
import { ButtonGroup } from 'react-bootstrap'
import { Eye as IconEye, FileText as IconFileText, WindowSplit as IconWindowSplit } from 'react-bootstrap-icons'
import { IconButton } from '../../../../../components/common/icon-button/icon-button'
import { setEditorSplitPosition } from '../../../../../redux/editor-config/methods'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'

/**
 * Extended AppBar for the editor mode that includes buttons to switch between the different editor modes
 */
export const EditorModeExtendedAppBar: React.FC<PropsWithChildren> = ({ children }) => {
  const splitValue = useApplicationState((state) => state.editorConfig.splitPosition)

  const onClickEditorOnly = useCallback(() => {
    setEditorSplitPosition(100)
  }, [])

  const onClickBothViews = useCallback(() => {
    setEditorSplitPosition(50)
  }, [])

  const onClickViewOnly = useCallback(() => {
    setEditorSplitPosition(0)
  }, [])

  const titleEditorOnly = useTranslatedText('editor.viewMode.edit')
  const titleBothViews = useTranslatedText('editor.viewMode.both')
  const titleViewOnly = useTranslatedText('editor.viewMode.view')

  return (
    <BaseAppBar
      additionalContentLeft={
        <Fragment>
          <ButtonGroup>
            <IconButton
              icon={IconFileText}
              title={titleEditorOnly}
              onClick={onClickEditorOnly}
              variant={splitValue === 100 ? 'secondary' : 'outline-secondary'}
            />
            <IconButton
              icon={IconWindowSplit}
              title={titleBothViews}
              onClick={onClickBothViews}
              variant={splitValue > 0 && splitValue < 100 ? 'secondary' : 'outline-secondary'}
            />
            <IconButton
              icon={IconEye}
              title={titleViewOnly}
              onClick={onClickViewOnly}
              variant={splitValue === 0 ? 'secondary' : 'outline-secondary'}
            />
          </ButtonGroup>
        </Fragment>
      }>
      {children}
    </BaseAppBar>
  )
}
