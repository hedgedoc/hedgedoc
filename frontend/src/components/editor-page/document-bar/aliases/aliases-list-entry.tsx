/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import type { Alias } from '../../../../api/alias/types'
import { deleteAlias, markAliasAsPrimary } from '../../../../api/alias'
import { updateMetadata } from '../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { testId } from '../../../../utils/test-id'

export interface AliasesListEntryProps {
  alias: Alias
}

/**
 * Component that shows an entry in the aliases list with buttons to remove it or mark it as primary.
 *
 * @param alias The alias.
 */
export const AliasesListEntry: React.FC<AliasesListEntryProps> = ({ alias }) => {
  const { t } = useTranslation()
  const { showErrorNotification } = useUiNotifications()

  const onRemoveClick = useCallback(() => {
    deleteAlias(alias.name)
      .then(updateMetadata)
      .catch(showErrorNotification(t('editor.modal.aliases.errorRemovingAlias')))
  }, [alias, t, showErrorNotification])

  const onMakePrimaryClick = useCallback(() => {
    markAliasAsPrimary(alias.name)
      .then(updateMetadata)
      .catch(showErrorNotification(t('editor.modal.aliases.errorMakingPrimary')))
  }, [alias, t, showErrorNotification])

  return (
    <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
      {alias.name}
      <div>
        <ShowIf condition={alias.primaryAlias}>
          <Button
            className={'me-2 text-warning'}
            variant='light'
            disabled={true}
            title={t('editor.modal.aliases.isPrimary') ?? undefined}
            {...testId('aliasIsPrimary')}>
            <ForkAwesomeIcon icon={'star'} />
          </Button>
        </ShowIf>
        <ShowIf condition={!alias.primaryAlias}>
          <Button
            className={'me-2'}
            variant='light'
            title={t('editor.modal.aliases.makePrimary') ?? undefined}
            onClick={onMakePrimaryClick}
            {...testId('aliasButtonMakePrimary')}>
            <ForkAwesomeIcon icon={'star-o'} />
          </Button>
        </ShowIf>
        <Button
          variant='light'
          className={'text-danger'}
          title={t('editor.modal.aliases.removeAlias') ?? undefined}
          onClick={onRemoveClick}
          {...testId('aliasButtonRemove')}>
          <ForkAwesomeIcon icon={'times'} />
        </Button>
      </div>
    </li>
  )
}
