/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractFileType } from '@hedgedoc/commons'
import { fromByteArray } from 'base64-js'

/**
 * Fetches a resource from a remote URL and returns a base64-encoded data URI for it
 *
 * @param url The URL to fetch
 * @param fetchOptions Optional further options for the underlying fetch
 * @returns The constructed data URI
 */
export const fetchAsBase64 = async (url: string, fetchOptions?: RequestInit): Promise<string> => {
  const response = await fetch(url, fetchOptions)
  const buffer = await response.arrayBuffer()
  const byteArray = new Uint8Array(buffer)
  const base64 = fromByteArray(byteArray)
  const fileType = await extractFileType(buffer)
  return `data:${fileType?.mime ?? 'application/octet-stream'};base64,${base64}`
}
