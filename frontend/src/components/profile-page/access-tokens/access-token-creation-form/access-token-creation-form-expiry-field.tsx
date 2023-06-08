/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { useExpiryDates } from './hooks/use-expiry-dates'
import type { ChangeEvent } from 'react'
import React from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface AccessTokenCreationFormExpiryFieldProps extends AccessTokenCreationFormFieldProps {
  onChangeExpiry: (event: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Input field for expiry of a new token.
 *
 * @param formValues The values of the stored form values.
 * @param onChangeExpiry Callback that updates the stored expiry form value.
 */
export const AccessTokenCreationFormExpiryField: React.FC<AccessTokenCreationFormExpiryFieldProps> = ({
  onChangeExpiry,
  formValues
}) => {
  useTranslation()
  const minMaxDefaultDates = useExpiryDates()

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey={'profile.accessTokens.expiry'} />
      </Form.Label>
      <Form.Control
        type='date'
        size='sm'
        value={formValues.expiryDate}
        onChange={onChangeExpiry}
        min={minMaxDefaultDates.min}
        max={minMaxDefaultDates.max}
        required
        {...cypressId('access-token-add-input-expiry')}
      />
    </Form.Group>
  )
}
