/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiProduces,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TokenAuthGuard } from '../../../auth/token.strategy';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { ServerStatusDto } from '../../../monitoring/server-status.dto';
import {
  forbiddenDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';

@UseGuards(TokenAuthGuard)
@ApiTags('monitoring')
@ApiSecurity('token')
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get()
  @ApiOkResponse({
    description: 'The server info',
    type: ServerStatusDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  getStatus(): Promise<ServerStatusDto> {
    // TODO: toServerStatusDto.
    return this.monitoringService.getServerStatus();
  }

  @Get('prometheus')
  @ApiOkResponse({
    description: 'Prometheus compatible monitoring data',
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiProduces('text/plain')
  getPrometheusStatus(): string {
    return '';
  }
}
