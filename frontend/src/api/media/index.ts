/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { ImageProxyRequestDto, ImageProxyResponse } from './types'

/**
 * Requests an image-proxy URL from the backend for a given image URL.
 *
 * @param imageUrl The image URL which should be proxied.
 * @return The proxy URL for the image.
 * @throws {Error} when the api request wasn't successful.
 */
export const getProxiedUrl = async (imageUrl: string): Promise<ImageProxyResponse> => {
  const response = await new PostApiRequestBuilder<ImageProxyResponse, ImageProxyRequestDto>('media/proxy')
    .withJsonBody({
      url: imageUrl
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Uploads a media file to the backend and returns the UUID of the uploaded media object.
 *
 * @param noteAlias The id or alias of the note from which the media is uploaded.
 * @param media The binary media content.
 * @return The UUID of the uploaded media object.
 * @throws {Error} when the api request wasn't successful.
 */
export const uploadFile = async (noteAlias: string, media: File): Promise<string> => {
  const postData = new FormData()
  postData.append('file', media)
  const response = await new PostApiRequestBuilder<string, void>('media')
    .withHeader('HedgeDoc-Note', noteAlias)
    .withBody(postData)
    .sendRequest()
  return response.getResponse().text()
}

/**
 * Deletes some uploaded media object.
 *
 * @param mediaId The identifier of the media object to delete.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteUploadedMedia = async (mediaId: string): Promise<void> => {
  await new DeleteApiRequestBuilder('media/' + mediaId).sendRequest()
}
