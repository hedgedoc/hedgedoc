/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { isMockMode } from '../utils/test-modes'

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

/**
 * Intercepts a mock HTTP request, checks the used request method and responds with given response content or an error
 * that the request method is not allowed.
 *
 * @param method The expected HTTP method.
 * @param req The request object.
 * @param res The response object.
 * @param response The response data that will be returned when the HTTP method was the expected one.
 * @param statusCode The status code with which the response will be sent.
 * @return {@link true} if the HTTP method of the request is the expected one, {@link false} otherwise.
 */
export const respondToMatchingRequest = <T>(
  method: HttpMethod,
  req: NextApiRequest,
  res: NextApiResponse,
  response: T,
  statusCode = 200
): boolean => {
  if (!isMockMode) {
    res.status(404).send('Mock API is disabled')
    return false
  }
  if (method !== req.method) {
    res.status(405).send('Method not allowed')
    return false
  } else {
    res.status(statusCode).json(response)
    return true
  }
}
