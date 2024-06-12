/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export interface MediaUpload {
  uuid: string
  fileName: string
  noteId: string | null
  createdAt: string
  username: string | null
}

export interface ImageProxyResponse {
  url: string
}

export interface ImageProxyRequestDto {
  url: string
}
