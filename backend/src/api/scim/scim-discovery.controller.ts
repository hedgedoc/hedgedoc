/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { ScimAuthGuard } from './scim-auth.guard';
import { ScimService } from './scim.service';

const SCIM_CONTENT_TYPE = 'application/scim+json';

@UseGuards(ScimAuthGuard)
@Controller()
export class ScimDiscoveryController {
  constructor(private readonly scimService: ScimService) {}

  @Get('ServiceProviderConfig')
  getServiceProviderConfig(@Res() reply: FastifyReply): void {
    const result = this.scimService.getServiceProviderConfig();
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Get('ResourceTypes')
  getResourceTypes(@Res() reply: FastifyReply): void {
    const result = this.scimService.getResourceTypes();
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Get('Schemas')
  getSchemas(@Res() reply: FastifyReply): void {
    const result = this.scimService.getSchemas();
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }
}
