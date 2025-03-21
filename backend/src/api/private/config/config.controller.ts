/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FrontendConfigDto } from '@hedgedoc/commons';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FrontendConfigService } from '../../../frontend-config/frontend-config.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/openapi.decorator';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private frontendConfigService: FrontendConfigService,
  ) {
    this.logger.setContext(ConfigController.name);
  }

  @Get()
  @OpenApi(200)
  async getFrontendConfig(): Promise<FrontendConfigDto> {
    return await this.frontendConfigService.getFrontendConfig();
  }
}
