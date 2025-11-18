/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { OpenApi } from '../api/utils/openapi.decorator';
import { SummaryRequestDto } from './summary-request.dto';
import { SummaryResponseDto } from './summary-response.dto';
import { SummaryCheckResponseDto } from './summary-check-response.dto';
import { SummaryService } from './summary.service';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('summary')
@Controller('summary')
export class SummaryController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private summaryService: SummaryService,
  ) {
    this.logger.setContext(SummaryController.name);
  }

  @Post()
  @OpenApi(200, 400, 500)
  async generateSummary(
    @Body() summaryRequest: SummaryRequestDto,
  ): Promise<SummaryResponseDto> {
    this.logger.debug(
      `Generating summary for text length: ${summaryRequest.text.length}`,
      'generateSummary',
    );
    const summary = await this.summaryService.generateSummary(
      summaryRequest.text,
    );
    return { summary };
  }

  @Post('check')
  @OpenApi(200, 400, 500)
  async checkForIssues(
    @Body() summaryRequest: SummaryRequestDto,
  ): Promise<SummaryCheckResponseDto> {
    this.logger.debug(
      `Checking note for issues. Text length: ${summaryRequest.text.length}`,
      'checkForIssues',
    );
    const issues = await this.summaryService.checkForErrors(
      summaryRequest.text,
    );
    return { issues };
  }
}
