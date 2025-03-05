/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType, OptionalSortMode, SortMode } from '@hedgedoc/commons';
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { NoteExploreEntryDto } from '../../../dtos/note-explore-entry.dto';
import { ExploreService } from '../../../explore/explore.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';

type OptionalNoteType = NoteType | '';

@UseGuards(SessionGuard)
@OpenApi(401, 403)
@ApiTags('explore')
@Controller('explore')
export class ExploreController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly exploreService: ExploreService,
  ) {
    this.logger.setContext(ExploreController.name);
  }

  @Get('my')
  @OpenApi(200)
  getMyNotes(
    @RequestUserId() userId: number,
    @Query('page') page: number,
    @Query('sort') sort?: OptionalSortMode,
    @Query('search') search?: string,
    @Query('type') type?: OptionalNoteType,
  ): Promise<NoteExploreEntryDto[]> {
    this.checkQueryParams(page, sort, type);
    return this.exploreService.getMyNoteExploreEntries(
      userId,
      page,
      type,
      sort,
      search,
    );
  }

  @Get('shared')
  @OpenApi(200)
  getSharedNotes(
    @RequestUserId() userId: number,
    @Query('page') page: number,
    @Query('sort') sort?: OptionalSortMode,
    @Query('search') search?: string,
    @Query('type') type?: OptionalNoteType,
  ): Promise<NoteExploreEntryDto[]> {
    this.checkQueryParams(page, sort, type);
    return this.exploreService.getSharedWithMeExploreEntries(
      userId,
      page,
      type,
      sort,
      search,
    );
  }

  @Get('public')
  @OpenApi(200)
  getPublicNotes(
    @Query('page') page: number,
    @Query('sort') sort?: OptionalSortMode,
    @Query('search') search?: string,
    @Query('type') type?: OptionalNoteType,
  ): Promise<NoteExploreEntryDto[]> {
    this.checkQueryParams(page, sort, type);
    return this.exploreService.getPublicNoteExploreEntries(
      page,
      type,
      sort,
      search,
    );
  }

  @Get('pinned')
  @OpenApi(200)
  getMyPinnedNotes(
    @RequestUserId() userId: number,
  ): Promise<NoteExploreEntryDto[]> {
    return this.exploreService.getMyPinnedNoteExploreEntries(userId);
  }

  private checkQueryParams(
    page: number,
    sort?: OptionalSortMode,
    type?: OptionalNoteType,
  ): void {
    this.ensurePageNumberIsValid(page);
    this.ensureTypeQueryParamIsValid(type);
    this.ensureSortQueryParamIsValid(sort);
  }

  private ensurePageNumberIsValid(page: number): void {
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
  }

  private ensureTypeQueryParamIsValid(type?: OptionalNoteType): void {
    if (type === undefined || type === '') {
      return;
    }
    const validValues = Object.values(NoteType);
    if (!validValues.includes(type)) {
      throw new BadRequestException(`Invalid note type in search: ${type}`);
    }
  }

  private ensureSortQueryParamIsValid(sort?: OptionalSortMode): void {
    if (sort === undefined || sort === '') {
      return;
    }
    const validValues = Object.values(SortMode);
    if (!validValues.includes(sort)) {
      throw new BadRequestException(`Invalid sort mode in search: ${sort}`);
    }
  }
}
