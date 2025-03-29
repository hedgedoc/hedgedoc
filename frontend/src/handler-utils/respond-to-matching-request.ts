/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isMockMode, isTestMode } from '../utils/test-modes'
import type { NextApiRequest, NextApiResponse } from 'next'

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
 * @param respondMethodNotAllowedOnMismatch If set and the method can't process the request then a 405 will be returned. Used for chaining multiple calls together.
 * @return {@link true} if the HTTP method of the request is the expected one, {@link false} otherwise.
 */
export const respondToMatchingRequest = <T>(
  method: HttpMethod,
  req: NextApiRequest,
  res: NextApiResponse,
  response: T,
  statusCode: number = 200,
  respondMethodNotAllowedOnMismatch: boolean = true
): boolean => {
  if (!isMockMode) {
    res.status(404).send('Mock API is disabled')
    return false
  } else if (method === req.method) {
    res.status(statusCode).json(response)
    return true
  } else if (respondMethodNotAllowedOnMismatch) {
    res.status(405).send('Method not allowed')
    return true
  } else {
    return false
  }
}

/**
 * Intercepts a mock HTTP request that is only allowed in test mode.
 * Such requests can only be issued from localhost and only if mock API is activated.
 *
 * @param req The request object.
 * @param res The response object.
 * @param response The response data that will be returned when the HTTP method was the expected one.
 */
export const respondToTestRequest = <T>(req: NextApiRequest, res: NextApiResponse, response: () => T): boolean => {
  if (!isMockMode) {
    res.status(404).send('Mock API is disabled')
  } else if (req.method !== HttpMethod.POST) {
    res.status(405).send('Method not allowed')
  } else if (!isTestMode) {
    res.status(404).send('Route only available in test mode')
  } else if (
    req.socket.remoteAddress === undefined ||
    !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)
  ) {
    res.status(403).send(`Request must come from localhost but was ${req.socket.remoteAddress}`)
  } else {
    res.status(200).json(response())
  }
  return true
}
