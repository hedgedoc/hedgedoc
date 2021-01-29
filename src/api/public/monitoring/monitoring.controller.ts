/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from '../../../monitoring/monitoring.service';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';
import { ApiSecurity } from '@nestjs/swagger';
import { ServerStatusDto } from '../../../monitoring/server-status.dto';

@ApiSecurity('token')
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @UseGuards(TokenAuthGuard)
  @Get()
  getStatus() : Promise<ServerStatusDto> {
    // TODO: toServerStatusDto.
    return this.monitoringService.getServerStatus();
  }

  @UseGuards(TokenAuthGuard)
  @Get('prometheus')
  getPrometheusStatus() {
    return '';
  }
}
