/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FormEvent } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useAsync } from 'react-use'
import { cancelPendingUser, confirmPendingUser, getPendingUserInfo } from '../../../api/auth/pending-user'
import { useRouter } from 'next/navigation'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { UsernameLabelField } from '../../common/fields/username-label-field'
import { DisplayNameField } from '../../common/fields/display-name-field'
import { ProfilePictureChoice, ProfilePictureSelectField } from '../../common/fields/profile-picture-select-field'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { fetchAndSetUser } from '../utils/fetch-and-set-user'

/**
 * The card where a new user can enter their user information.
 */
export const NewUserCard: React.FC = () => {
  const router = useRouter()
  const { showErrorNotification } = useUiNotifications()
  const { value, error, loading } = useAsync(getPendingUserInfo, [])
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pictureChoice, setPictureChoice] = useState(ProfilePictureChoice.FALLBACK)
  const [isUsernameSubmittable, setIsUsernameSubmittable] = useState(false)
  const [isDisplayNameSubmittable, setIsDisplayNameSubmittable] = useState(false)

  const isSubmittable = useMemo(() => {
    return isUsernameSubmittable && isDisplayNameSubmittable
  }, [isUsernameSubmittable, isDisplayNameSubmittable])

  const onChangeUsername = useOnInputChange(setUsername)
  const onChangeDisplayName = useOnInputChange(setDisplayName)

  const submitUserdata = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      let profilePicture: string | null = null
      if (pictureChoice === ProfilePictureChoice.PROVIDER && value) {
        profilePicture = value.photoUrl
      }

      confirmPendingUser({
        username,
        displayName,
        profilePicture
      })
        .then(() => fetchAndSetUser())
        .then(() => {
          router.push('/')
        })
        .catch(showErrorNotification('login.welcome.error'))
    },
    [pictureChoice, value, username, displayName, showErrorNotification, router]
  )

  const cancelUserCreation = useCallback(() => {
    cancelPendingUser()
      .catch(showErrorNotification('login.welcome.cancelError'))
      .finally(() => {
        router.push('/login')
      })
  }, [router, showErrorNotification])

  useEffect(() => {
    if (error) {
      showErrorNotification('login.welcome.error')(error)
      router.push('/login')
    }
  }, [error, router, showErrorNotification])

  useEffect(() => {
    if (!value) {
      return
    }
    setUsername(value.username ?? '')
    setDisplayName(value.displayName ?? '')
    if (value.photoUrl) {
      setPictureChoice(ProfilePictureChoice.PROVIDER)
    }
  }, [value])

  if (!value && !loading) {
    return null
  }

  return (
    <Card>
      <Card.Body>
        {loading && <p>Loading...</p>}
        <Card.Title>
          {displayName !== '' ? (
            <Trans i18nKey={'login.welcome.title'} values={{ name: displayName }} />
          ) : (
            <Trans i18nKey={'login.welcome.titleFallback'} />
          )}
        </Card.Title>
        <Trans i18nKey={'login.welcome.description'} />
        <hr />
        <Form onSubmit={submitUserdata} className={'d-flex flex-column gap-3'}>
          <DisplayNameField
            onChange={onChangeDisplayName}
            value={displayName}
            onValidityChange={setIsDisplayNameSubmittable}
          />
          <UsernameLabelField
            onChange={onChangeUsername}
            value={username}
            onValidityChange={setIsUsernameSubmittable}
          />
          <ProfilePictureSelectField
            onChange={setPictureChoice}
            value={pictureChoice}
            photoUrl={value?.photoUrl ?? null}
            username={username}
          />
          <div className={'d-flex gap-3'}>
            <Button variant={'secondary'} type={'button'} className={'w-50'} onClick={cancelUserCreation}>
              <Trans i18nKey={'common.cancel'} />
            </Button>
            <Button variant={'success'} type={'submit'} className={'w-50'} disabled={!isSubmittable}>
              <Trans i18nKey={'common.continue'} />
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
