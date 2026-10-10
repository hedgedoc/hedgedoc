/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteAlias, markAliasAsPrimary } from '../../../../../../api/alias'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { updateMetadata } from '../../../../../../redux/note-details/methods'
import { testId } from '../../../../../../utils/test-id'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import React, { useCallback } from 'react'
import { Star as IconStar, StarFill as IconStarFill, X as IconX } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { IconButton } from '../../../../../common/icon-button/icon-button'
import styles from './aliases-list-entry.module.css'
import { UiIcon } from '../../../../../common/icons/ui-icon'
import { AliasesListAliasEntry } from './aliases-list-alias-entry'

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
      .catch(showErrorNotificationBuilder(t('editor.aliases.errorRemovingAlias')))
  }, [alias, t, showErrorNotificationBuilder])

  const onMakePrimaryClick = useCallback(() => {
    markAliasAsPrimary(alias)
      .then(updateMetadata)
      .catch(showErrorNotificationBuilder(t('editor.aliases.errorMakingPrimary')))
  }, [alias, t, showErrorNotificationBuilder])

  const isPrimaryText = useTranslatedText('editor.aliases.isPrimary')
  const makePrimaryText = useTranslatedText('editor.aliases.makePrimary')
  const removeAliasText = useTranslatedText('editor.aliases.removeAlias')

  return (
    <li className={'d-flex flex-row justify-content-between align-items-center my-1'}>
      <AliasesListAliasEntry alias={alias}/>
      <div>
        {alias === primaryAlias ? (
          <UiIcon
            className={`p-1 mx-1 ${styles['primary']}`}
            size={'24px'}
            icon={IconStarFill}
            title={isPrimaryText} />
        ) : (
          <IconButton
            className={'p-1 mx-1'}
            variant='secondary'
            disabled={!isOwner}
            title={makePrimaryText}
            onClick={onMakePrimaryClick}
            {...testId('aliasButtonMakePrimary')}
            icon={IconStar}
          />
        )}
        <IconButton
          className={'p-1'}
          variant='danger'
          disabled={!isOwner || alias === primaryAlias}
          title={removeAliasText}
          onClick={onRemoveClick}
          {...testId('aliasButtonRemove')}
          icon={IconX}
        />
      </div>
    </li>
  )
}
