/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { cypressId } from '../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { FormatType } from '../../../../redux/note-details/types'
import type { IconName } from '../../../common/fork-awesome/types'
import { useTranslation } from 'react-i18next'
import { formatSelection } from '../../../../redux/note-details/methods'

export interface ToolbarButtonProps {
  icon: IconName
  formatType: FormatType
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ formatType, icon }) => {
  const { t } = useTranslation('', { keyPrefix: 'editor.editorToolbar' })

  const onClick = useCallback(() => {
    formatSelection(formatType)
  }, [formatType])

  const title = useMemo(() => t(formatType), [formatType, t])

  return (
    <Button variant='light' onClick={onClick} title={title} {...cypressId('toolbar.' + formatType)}>
      <ForkAwesomeIcon icon={icon} />
    </Button>
  )
}
