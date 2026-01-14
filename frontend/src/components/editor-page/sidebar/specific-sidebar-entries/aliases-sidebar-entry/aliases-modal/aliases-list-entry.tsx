/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteAlias, markAliasAsPrimary } from '../../../../../../api/alias'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { updateMetadata } from '../../../../../../redux/note-details/methods'
import { testId } from '../../../../../../utils/test-id'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Badge } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { Star as IconStar, X as IconX } from 'react-bootstrap-icons'
import { useTranslation, Trans } from 'react-i18next'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'

export interface AliasesListEntryProps {
  alias: string
}

/**
 * Component that shows an entry in the aliases list with buttons to remove it or mark it as primary.
 *
 * @param alias The alias.
 */
export const AliasesListEntry: React.FC<AliasesListEntryProps> = ({ alias }) => {
  const { t } = useTranslation()
  const { showErrorNotificationBuilder } = useUiNotifications()
  const primaryAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const isOwner = useIsOwner()

  const onRemoveClick = useCallback(() => {
    deleteAlias(alias)
      .then(updateMetadata)
      .catch(showErrorNotificationBuilder(t('editor.modal.aliases.errorRemovingAlias')))
  }, [alias, t, showErrorNotificationBuilder])

  const onMakePrimaryClick = useCallback(() => {
    markAliasAsPrimary(alias)
      .then(updateMetadata)
      .catch(showErrorNotificationBuilder(t('editor.modal.aliases.errorMakingPrimary')))
  }, [alias, t, showErrorNotificationBuilder])

  const isPrimaryText = useTranslatedText('editor.modal.aliases.isPrimary')
  const makePrimaryText = useTranslatedText('editor.modal.aliases.makePrimary')
  const removeAliasText = useTranslatedText('editor.modal.aliases.removeAlias')

  return (
    <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
      <div>
        {alias}
        {alias === primaryAlias && (
          <Badge bg='secondary' className={'ms-2'} title={isPrimaryText} {...testId('aliasPrimaryBadge')}>
            <Trans i18nKey={'editor.modal.aliases.primaryLabel'}></Trans>
          </Badge>
        )}
      </div>
      <div>
        {alias !== primaryAlias && (
          <Button
            className={'me-2'}
            variant='secondary'
            disabled={!isOwner}
            title={makePrimaryText}
            onClick={onMakePrimaryClick}
            {...testId('aliasButtonMakePrimary')}>
            <UiIcon icon={IconStar} />
          </Button>
        )}
        <Button
          variant='danger'
          disabled={!isOwner || alias === primaryAlias}
          title={removeAliasText}
          onClick={onRemoveClick}
          {...testId('aliasButtonRemove')}>
          <UiIcon icon={IconX} />
        </Button>
      </div>
    </li>
  )
}
