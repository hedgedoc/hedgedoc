/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { cypressId } from '../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'
import { useTranslation } from 'react-i18next'
import { useChangeEditorContentCallback } from '../../change-content-context/use-change-editor-content-callback'
import type { ContentFormatter } from '../../change-content-context/change-content-context'

export interface ToolbarButtonProps {
  i18nKey: string
  iconName: IconName
  formatter: ContentFormatter
}

/**
 * Renders a button for the editor toolbar that formats the content using a given formatter function.
 *
 * @param i18nKey Used to generate a title for the button by interpreting it as translation key in the i18n-namespace `editor.editorToolbar`-
 * @param iconName A fork awesome icon name that is shown in the button
 * @param formatter The formatter function changes the editor content on click
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ i18nKey, iconName, formatter }) => {
  const { t } = useTranslation('', { keyPrefix: 'editor.editorToolbar' })
  const changeEditorContent = useChangeEditorContentCallback()

  const onClick = useCallback(() => {
    changeEditorContent?.(formatter)
  }, [formatter, changeEditorContent])
  const title = useMemo(() => t(i18nKey), [i18nKey, t])

  return (
    <Button
      variant='light'
      onClick={onClick}
      title={title}
      disabled={!changeEditorContent}
      {...cypressId('toolbar.' + i18nKey)}>
      <ForkAwesomeIcon icon={iconName} />
    </Button>
  )
}
