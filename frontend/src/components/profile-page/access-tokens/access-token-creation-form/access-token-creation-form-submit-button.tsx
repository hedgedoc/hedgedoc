/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Submit button for creating a new access token.
 */
export const AccessTokenCreationFormSubmitButton: React.FC<AccessTokenCreationFormFieldProps> = ({ formValues }) => {
  const validFormValues = useMemo(() => {
    return formValues.label.trim() !== '' && formValues.expiryDate.trim() !== ''
  }, [formValues])

  return (
    <Button
      type='submit'
      variant='primary'
      size='sm'
      disabled={!validFormValues}
      {...cypressId('access-token-add-button')}>
      <Trans i18nKey='profile.accessTokens.createToken' />
    </Button>
  )
}
