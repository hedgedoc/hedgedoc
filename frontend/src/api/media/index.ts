/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { ImageProxyRequestDto, ImageProxyResponse } from './types'
import type { MediaUploadDto } from '@hedgedoc/commons'

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
 * Uploads a media file to the backend.
 *
 * @param noteIdOrAlias The id or alias of the note from which the media is uploaded.
 * @param media The binary media content.
 * @return The URL of the uploaded media object.
 * @throws {Error} when the api request wasn't successful.
 */
export const uploadFile = async (noteIdOrAlias: string, media: File): Promise<MediaUploadDto> => {
  const postData = new FormData()
  postData.append('file', media)
  const response = await new PostApiRequestBuilder<MediaUploadDto, void>('media')
    .withHeader('HedgeDoc-Note', noteIdOrAlias)
    .withBody(postData)
    .sendRequest()
  return response.asParsedJsonObject()
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
