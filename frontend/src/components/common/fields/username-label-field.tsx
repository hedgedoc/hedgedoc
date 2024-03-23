/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UsernameFieldProps } from './username-field'
import { UsernameField } from './username-field'
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useDebounce } from 'react-use'
import { checkUsernameAvailability } from '../../../api/auth'
import { Logger } from '../../../utils/logger'
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import { REGEX_USERNAME } from '@hedgedoc/commons'

const logger = new Logger('UsernameLabelField')

/**
 * Wraps and contains label and info for UsernameField
 *
 * @param value The currently entered username.
 * @param onValidityChange Callback that is called when the validity of the field changes.
 * @param props Additional props for the UsernameField.
 */
export const UsernameLabelField: React.FC<UsernameFieldProps> = ({ value, onValidityChange, ...props }) => {
  useTranslation()
  const [usernameValid, setUsernameValid] = useState(false)
  const [usernameInvalid, setUsernameInvalid] = useState(false)
  const usernameChoosingAllowed = useFrontendConfig().allowChooseUsername

  useDebounce(
    () => {
      if (value === '') {
        setUsernameValid(false)
        setUsernameInvalid(false)
        return
      }
      if (!REGEX_USERNAME.test(value)) {
        setUsernameValid(false)
        setUsernameInvalid(true)
        return
      }
      checkUsernameAvailability(value)
        .then((available) => {
          setUsernameValid(available)
          setUsernameInvalid(!available)
        })
        .catch((error) => {
          logger.error('Failed to check username availability', error)
          setUsernameValid(false)
          setUsernameInvalid(false)
        })
    },
    500,
    [value]
  )

  useEffect(() => {
    onValidityChange?.(usernameValid && !usernameInvalid)
  }, [usernameValid, usernameInvalid, onValidityChange])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='login.auth.username' />
      </Form.Label>
      <UsernameField
        value={value}
        {...props}
        disabled={!usernameChoosingAllowed}
        isInvalid={usernameInvalid}
        isValid={usernameValid}
      />
      <Form.Text>
        <Trans i18nKey='login.register.usernameInfo' />
      </Form.Text>
    </Form.Group>
  )
}
