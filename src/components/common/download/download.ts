/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const download = (data: BlobPart, fileName: string, mimeType: string): void => {
  const file = new Blob([data], { type: mimeType })
  downloadLink(URL.createObjectURL(file), fileName)
}

export const downloadLink = (url: string, fileName: string): void => {
  const helperElement = document.createElement('a')
  helperElement.href = url
  helperElement.download = fileName
  document.body.appendChild(helperElement)
  helperElement.click()
  setTimeout(() => helperElement.remove(), 2000)
}
