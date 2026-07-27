/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmittingProxyImageFrame } from './event-emitting-proxy-image-frame'
import { ProxyImageFrame } from './proxy-image-frame'
import { ProxyImageReplacer } from './proxy-image-replacer'
import { Element } from 'domhandler'
import type { ReactElement } from 'react'

describe('ProxyImageReplacer', () => {
  const replacer = new ProxyImageReplacer()

  it('uses the lightbox image frame for standalone images', () => {
    const image = new Element('img', { src: 'https://example.com/image.png' })

    const replacement = replacer.replace(image) as ReactElement

    expect(replacement.type).toBe(EventEmittingProxyImageFrame)
    expect(replacement.props.className).toBe('cursor-zoom-in')
  })

  it('does not use the lightbox image frame for images inside links', () => {
    const image = new Element('img', { src: 'https://example.com/image.png' })
    const span = new Element('span', {}, [image])
    const link = new Element('a', { href: 'https://example.com' }, [span])
    image.parent = span
    span.parent = link

    const replacement = replacer.replace(image) as ReactElement

    expect(replacement.type).toBe(ProxyImageFrame)
    expect(replacement.props.className).toBe('')
  })
})
