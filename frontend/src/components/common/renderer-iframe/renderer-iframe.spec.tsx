/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import { render, screen } from '@testing-library/react'
import { RendererIframe } from './renderer-iframe'

jest.mock('../../editor-page/render-context/editor-to-renderer-communicator-context-provider', () => ({
  useEditorToRendererCommunicator: () => ({
    enableCommunication: jest.fn(),
    getUuid: () => 'test-uuid',
    sendMessageToOtherSide: jest.fn(),
    setMessageTarget: jest.fn(),
    unsetMessageTarget: jest.fn()
  })
}))

jest.mock('../../markdown-renderer/hooks/use-extension-event-emitter', () => ({
  useExtensionEventEmitter: () => undefined
}))

jest.mock('../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler', () => ({
  useEditorReceiveHandler: jest.fn()
}))

jest.mock('./hooks/use-effect-on-render-type-change', () => ({
  useEffectOnRenderTypeChange: jest.fn()
}))

jest.mock('./hooks/use-force-render-page-url-on-iframe-load-callback', () => ({
  useForceRenderPageUrlOnIframeLoadCallback: () => jest.fn()
}))

jest.mock('./hooks/use-send-additional-configuration-to-renderer', () => ({
  useSendAdditionalConfigurationToRenderer: jest.fn()
}))

jest.mock('./hooks/use-send-fragment-to-renderer', () => ({
  useSendFragmentToRenderer: jest.fn()
}))

jest.mock('./hooks/use-send-markdown-to-renderer', () => ({
  useSendMarkdownToRenderer: jest.fn()
}))

jest.mock('./hooks/use-send-scroll-state', () => ({
  useSendScrollState: jest.fn()
}))

describe('RendererIframe', () => {
  it('includes security sandboxing attributes for the iframe', () => {
    render(<RendererIframe markdownContentLines={[]} rendererType={RendererType.DOCUMENT} />)

    const expectedArguments = [
      'allow-downloads',
      'allow-same-origin',
      'allow-scripts',
      'allow-popups',
      'allow-popups-to-escape-sandbox',
      'allow-modals'
    ]
    const renderer = screen.getByTitle('render')
    for (const argument of expectedArguments) {
      expect(renderer).toHaveAttribute('sandbox', expect.stringContaining(argument))
    }
  })
})
