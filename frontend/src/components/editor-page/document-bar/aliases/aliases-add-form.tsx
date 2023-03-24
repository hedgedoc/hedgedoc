/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addAlias } from '../../../../api/alias'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useIsOwner } from '../../../../hooks/common/use-is-owner'
import { useOnInputChange } from '../../../../hooks/common/use-on-input-change'
import { updateMetadata } from '../../../../redux/note-details/methods'
import { testId } from '../../../../utils/test-id'
import { UiIcon } from '../../../common/icons/ui-icon'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { Plus as IconPlus } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

const validAliasRegex = /^[a-z0-9_-]*$/

/**
 * Form for adding a new alias to a note.
 */
export const AliasesAddForm: React.FC = () => {
  const { t } = useTranslation()
  const { showErrorNotification } = useUiNotifications()
  const noteId = useApplicationState((state) => state.noteDetails.id)
  const isOwner = useIsOwner()
  const [newAlias, setNewAlias] = useState('')

  const onAddAlias = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      addAlias(noteId, newAlias)
        .then(updateMetadata)
        .catch(showErrorNotification('editor.modal.aliases.errorAddingAlias'))
        .finally(() => {
          setNewAlias('')
        })
    },
    [noteId, newAlias, setNewAlias, showErrorNotification]
  )

  const onNewAliasInputChange = useOnInputChange(setNewAlias)

  const newAliasValid = useMemo(() => {
    return validAliasRegex.test(newAlias)
  }, [newAlias])

  return (
    <form onSubmit={onAddAlias}>
      <InputGroup className={'me-1 mb-1'} hasValidation={true}>
        <Form.Control
          value={newAlias}
          placeholder={t('editor.modal.aliases.addAlias') ?? undefined}
          onChange={onNewAliasInputChange}
          isInvalid={!newAliasValid}
          disabled={!isOwner}
          required={true}
          {...testId('addAliasInput')}
        />
        <Button
          type={'submit'}
          variant='light'
          className={'text-secondary ms-2'}
          disabled={!isOwner || !newAliasValid || newAlias === ''}
          title={t('editor.modal.aliases.addAlias') ?? undefined}
          {...testId('addAliasButton')}>
          <UiIcon icon={IconPlus} />
        </Button>
      </InputGroup>
    </form>
  )
}
