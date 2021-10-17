/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import type { EditorPagePathParams } from '../editor-page'

export const ReadOnlyModeButton: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<EditorPagePathParams>()

  return (
    <Link to={`/s/${id}`} target='_blank'>
      <Button
        title={t('editor.documentBar.readOnlyMode')}
        className='ml-2 text-secondary'
        size='sm'
        variant='outline-light'>
        <ForkAwesomeIcon icon='file-text-o' />
      </Button>
    </Link>
  )
}
