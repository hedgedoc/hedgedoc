/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { CSRF_EXEMPT_KEY } from '../../utils/decorators/csrf-exempt.decorator';

const UNPROTECTED_METHODS = ['GET', 'HEAD', 'OPTIONS'];

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as CSRF exempt
    const isCsrfExempt = this.reflector.getAllAndOverride<boolean>(CSRF_EXEMPT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isCsrfExempt) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    // Ignore unprotected methods (GET, HEAD, OPTIONS)
    const method = request.method.toUpperCase();
    if (UNPROTECTED_METHODS.includes(method)) {
      return true;
    }

    // Ignore non-private API requests
    if (!request.url.startsWith('/api/private')) {
      return true;
    }

    // Otherwise, check for CSRF-Token header and validate it
    const token = request.headers['csrf-token'] as string | undefined;
    if (!token) {
      throw new ForbiddenException('CSRF token required');
    }

    const csrfProtection = request.server.csrfProtection;
    if (!csrfProtection) {
      throw new ForbiddenException('CSRF protection failed to load');
    }

    try {
      const csrfProtectionPromise = new Promise<void>((resolve, reject) => {
        csrfProtection(request, reply, (err?: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      await csrfProtectionPromise;
      return true;
    } catch {
      throw new ForbiddenException('CSRF token invalid');
    }
  }
}
