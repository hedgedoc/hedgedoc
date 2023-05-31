/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../change-content-context/use-change-editor-content-callback'
import { useChangeEditorContentCallback } from '../../change-content-context/use-change-editor-content-callback'
import type { ToolbarButtonProps } from './toolbar-button'
import { ToolbarButton } from './toolbar-button'
import React, { useCallback } from 'react'

export interface FormatterToolbarButtonProps extends Omit<ToolbarButtonProps, 'onClick' | 'disabled'> {
  formatter: ContentFormatter
}

/**
 * Renders a button for the editor toolbar that formats the content using a given formatter function.
 *
 * @param i18nKey Used to generate a title for the button by interpreting it as translation key in the i18n-namespace `editor.editorToolbar`-
 * @param iconName A fork awesome icon name that is shown in the button
 * @param formatter The formatter function changes the editor content on click
 */
export const FormatterToolbarButton: React.FC<FormatterToolbarButtonProps> = ({ i18nKey, icon, formatter }) => {
  const changeEditorContent = useChangeEditorContentCallback()

  const onClick = useCallback(() => {
    changeEditorContent?.(formatter)
  }, [formatter, changeEditorContent])

  return <ToolbarButton i18nKey={i18nKey} icon={icon} onClick={onClick} disabled={!changeEditorContent} />
}
