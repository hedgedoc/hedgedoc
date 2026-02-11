/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { ScimAuthGuard } from '../scim-auth.guard';
import { ScimService } from '../scim.service';

const SCIM_CONTENT_TYPE = 'application/scim+json';

@UseGuards(ScimAuthGuard)
@Controller('Users')
export class ScimUsersController {
  constructor(private readonly scimService: ScimService) {}

  @Get()
  async listUsers(
    @Query() query: Record<string, string>,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.scimService.readUser(undefined, query);
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @Query() query: Record<string, string>,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.scimService.readUser(id, query);
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: Record<string, unknown>,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.scimService.writeUser(body);
    void reply.status(HttpStatus.CREATED).header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Put(':id')
  async replaceUser(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.scimService.writeUser(body, id);
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Patch(':id')
  async patchUser(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const result = await this.scimService.patchUser(id, body);
    void reply.header('Content-Type', SCIM_CONTENT_TYPE).send(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Res() reply: FastifyReply): Promise<void> {
    await this.scimService.deleteUser(id);
    void reply.status(HttpStatus.NO_CONTENT).send();
  }
}
