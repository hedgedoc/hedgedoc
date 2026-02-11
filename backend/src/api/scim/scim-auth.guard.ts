/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { FastifyRequest } from 'fastify';

import scimConfig, { ScimConfig } from '../../config/scim.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';

@Injectable()
export class ScimAuthGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,

    @Inject(scimConfig.KEY)
    private readonly scimConfiguration: ScimConfig,
  ) {
    this.logger.setContext(ScimAuthGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.scimConfiguration.bearerToken) {
      this.logger.debug('SCIM is disabled because no bearer token is configured.');
      throw new UnauthorizedException('SCIM is not enabled');
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    if (!this.timingSafeCompare(token, this.scimConfiguration.bearerToken)) {
      throw new UnauthorizedException('Invalid SCIM bearer token');
    }

    return true;
  }

  private timingSafeCompare(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      if (bufA.length !== bufB.length) {
        return false;
      }
      return timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }
}
