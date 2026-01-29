/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FastifyRequest } from 'fastify';
import type { SecurityConfig } from '../config/security.config';
import type { RequestWithSession } from '../api/utils/request.type';
import type { errorResponseBuilderContext } from '@fastify/rate-limit';

interface RateLimitConfig {
  max?: number;
  window?: number;
}

/**
 * Extracts the user ID from the session if present.
 *
 * @param req The incoming Fastify request
 * @returns The user ID if authenticated, undefined otherwise
 */
function getUserIdFromSession(req: FastifyRequest): number | undefined {
  return (req as RequestWithSession).session?.userId;
}

/**
 * Generates a rate-limiting key based on the request. It uses the user ID if the user is authenticated,
 * and falls back to the IP address for unauthenticated requests. The IP address is determined by
 * fastify's trustProxy option.
 *
 * @param req The incoming request object from which the key is generated.
 * @returns The generated rate-limiting key based on the user ID or IP address.
 */
export function generateRateLimitKey(req: FastifyRequest): string {
  const userId = getUserIdFromSession(req);
  if (userId !== undefined) {
    return `user:${userId}`;
  }
  return `ip:${req.ip}`;
}

/**
 * Retrieves the rate limit configuration based on the incoming request.
 *
 * @param req The request object of the incoming HTTP request.
 * @param securityConfig The security configuration containing rate limit settings.
 * @returns the appropriate rate limit configuration for the request.
 */
function getRateLimitConfigByRequest(
  req: FastifyRequest,
  securityConfig: SecurityConfig,
): RateLimitConfig {
  const path = req.routeOptions?.url ?? req.url;
  const userId = getUserIdFromSession(req);

  // Auth endpoints
  if (path.includes('/api/private/auth/')) {
    return securityConfig.rateLimit.auth;
  }

  // Public API, authenticated
  if (path.startsWith('/api/v2') && userId !== undefined) {
    return securityConfig.rateLimit.publicApi;
  }

  // Private API, authenticated
  if (path.startsWith('/api/private') && userId !== undefined) {
    return securityConfig.rateLimit.authenticated;
  }

  // Unauthenticated limits otherwise
  return securityConfig.rateLimit.unauthenticated;
}

/**
 * Creates a function that retrieves the rate limit time window in milliseconds for a given request.
 *
 * @param securityConfig The security configuration containing rate limit settings.
 * @return A function that takes a Fastify request and returns the time window in milliseconds.
 */
export function getTimeWindowByRequestWithSecurityConfig(
  securityConfig: SecurityConfig,
): (req: FastifyRequest, key: string) => number {
  return (req: FastifyRequest, _: string): number => {
    const configValue = getRateLimitConfigByRequest(req, securityConfig).window ?? 0;
    return configValue * 1000;
  };
}

/**
 * Creates a function that retrieves the rate limit maximum value for a given request.
 *
 * @param securityConfig The security configuration containing rate limit settings.
 * @return A function that takes a Fastify request and returns the max requests, or Infinity if no limit is set.
 */
export function getMaxLimitByRequestWithSecurityConfig(
  securityConfig: SecurityConfig,
): (req: FastifyRequest, key: string) => number {
  return (req: FastifyRequest, _: string): number => {
    const limit = getRateLimitConfigByRequest(req, securityConfig).max ?? 0;
    return limit === 0 ? Infinity : limit;
  };
}

/**
 * Builds a response object for rate-limiting scenarios.
 *
 * @param _ The fastify request object, unused
 * @param context The rate limiter context containing data about the current request
 * @returns The fastify error response
 */
export function buildRateLimitResponse(_: FastifyRequest, context: errorResponseBuilderContext) {
  return {
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Please try again later (${context.after}).`,
    expiresIn: context.ttl,
  };
}
