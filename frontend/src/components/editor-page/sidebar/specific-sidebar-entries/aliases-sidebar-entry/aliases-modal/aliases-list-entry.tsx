/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteAlias, markAliasAsPrimary } from '../../../../../../api/alias'
import type { Alias } from '../../../../../../api/alias/types'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import { updateMetadata } from '../../../../../../redux/note-details/methods'
import { testId } from '../../../../../../utils/test-id'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import { ShowIf } from '../../../../../common/show-if/show-if'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { StarFill as IconStarFill } from 'react-bootstrap-icons'
import { Star as IconStar } from 'react-bootstrap-icons'
import { X as IconX } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

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
  const isOwner = useIsOwner()

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
            <UiIcon icon={IconStar} />
          </Button>
        </ShowIf>
        <ShowIf condition={!alias.primaryAlias}>
          <Button
            className={'me-2'}
            variant='light'
            disabled={!isOwner}
            title={t('editor.modal.aliases.makePrimary') ?? undefined}
            onClick={onMakePrimaryClick}
            {...testId('aliasButtonMakePrimary')}>
            <UiIcon icon={IconStarFill} />
          </Button>
        </ShowIf>
        <Button
          variant='light'
          className={'text-danger'}
          disabled={!isOwner}
          title={t('editor.modal.aliases.removeAlias') ?? undefined}
          onClick={onRemoveClick}
          {...testId('aliasButtonRemove')}>
          <UiIcon icon={IconX} />
        </Button>
      </div>
    </li>
  )
}
