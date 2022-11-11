/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { CommonModal } from './common-modal'
import React from 'react'

describe('CommonModal', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('does not render if show is false', () => {
    const view = render(<CommonModal show={false}>testText</CommonModal>)
    expect(view.container).toMatchSnapshot()
  })

  it('renders correctly and calls onHide, when close button is clicked', async () => {
    const onHide = jest.fn()
    render(
      <CommonModal show={true} onHide={onHide} showCloseButton={true}>
        testText
      </CommonModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
    const closeButton = await screen.findByRole('button')
    fireEvent(
      closeButton,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    )
    expect(onHide).toHaveBeenCalled()
  })

  it('render correctly with title', async () => {
    render(
      <CommonModal show={true} title={'testTitle'}>
        testText
      </CommonModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })

  it('render correctly with i18nTitle', async () => {
    render(
      <CommonModal show={true} title={'testTitle'} titleIsI18nKey={true}>
        testText
      </CommonModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })

  it('render correctly with title icon', async () => {
    render(
      <CommonModal show={true} titleIcon={'heart'}>
        testText
      </CommonModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })

  it('render correctly with additionalClasses', async () => {
    render(
      <CommonModal show={true} additionalClasses={'testClass'}>
        testText
      </CommonModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })

  describe('render correctly in size', () => {
    it('lg', async () => {
      render(
        <CommonModal show={true} modalSize={'lg'}>
          testText
        </CommonModal>
      )
      const modal = await screen.findByTestId('commonModal')
      expect(modal).toMatchSnapshot()
    })

    it('sm', async () => {
      render(
        <CommonModal show={true} modalSize={'sm'}>
          testText
        </CommonModal>
      )
      const modal = await screen.findByTestId('commonModal')
      expect(modal).toMatchSnapshot()
    })

    it('xl', async () => {
      render(
        <CommonModal show={true} modalSize={'xl'}>
          testText
        </CommonModal>
      )
      const modal = await screen.findByTestId('commonModal')
      expect(modal).toMatchSnapshot()
    })
  })
})
