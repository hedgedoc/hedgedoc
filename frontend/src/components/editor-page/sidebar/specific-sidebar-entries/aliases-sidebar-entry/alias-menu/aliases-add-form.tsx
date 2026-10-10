/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addAlias } from '../../../../../../api/alias'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import { useOnInputChange } from '../../../../../../hooks/common/use-on-input-change'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { updateMetadata } from '../../../../../../redux/note-details/methods'
import { testId } from '../../../../../../utils/test-id'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import React, { useCallback, useMemo, useState } from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import { PlusLg as IconPlus } from 'react-bootstrap-icons'
import { ALIAS_REGEX } from '@hedgedoc/commons'
import { IconButton } from '../../../../../common/icon-button/icon-button'

/**
 * Form for adding a new alias to a note.
 */
export const AliasesAddForm: React.FC = () => {
  const { showErrorNotificationBuilder } = useUiNotifications()
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const isOwner = useIsOwner()
  const [newAlias, setNewAlias] = useState('')

  const onAddAlias = useCallback(() => {
    if (noteAlias === undefined) {
      return
    }
    addAlias(noteAlias, newAlias)
      .then(updateMetadata)
      .catch(showErrorNotificationBuilder('editor.aliases.errorAddingAlias'))
      .finally(() => {
        setNewAlias('')
      })
  }, [noteAlias, newAlias, setNewAlias, showErrorNotificationBuilder])

  const onNewAliasInputChange = useOnInputChange(setNewAlias)

  const newAliasValid = useMemo(() => {
    if (newAlias === '') {
      return true
    }
    return ALIAS_REGEX.test(newAlias)
  }, [newAlias])

  const addAliasText = useTranslatedText('editor.aliases.addAlias')

  return (
    <InputGroup className={'mb-1 my-1'} hasValidation={true}>
      <FormControl
        value={newAlias}
        placeholder={addAliasText}
        onChange={onNewAliasInputChange}
        isInvalid={!newAliasValid}
        disabled={!isOwner}
        required={true}
        {...testId('addAliasInput')}
      />
      <IconButton
        type={'submit'}
        variant='primary'
        className={'p-1'}
        disabled={!isOwner || !newAliasValid || newAlias === ''}
        title={addAliasText}
        onClick={onAddAlias}
        {...testId('addAliasButton')}
        icon={IconPlus}
      />
    </InputGroup>
  )
}
