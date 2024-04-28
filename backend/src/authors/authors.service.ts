/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ShortRealtimeUser } from '@hedgedoc/commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Author } from './author.entity';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Author) private authorsRepository: Repository<Author>,
  ) {
    this.logger.setContext(AuthorsService.name);
  }

  // /**
  //  * @async
  //  * Get or create the author specified by the short realtime user
  //  * @param {Username} username the username by which the user is specified
  //  * @param {UserRelationEnum[]} [withRelations=[]] if the returned user object should contain certain relations
  //  * @return {User} the specified user
  //  */
  // async findOrCreateAuthor(
  //   shortRealtimeUser: ShortRealtimeUser,
  // ): Promise<Author> {
  //   const author = await this.authorsRepository.findOne({
  //     where: { username: username },
  //     relations: withRelations,
  //   });
  //   if (user === null) {
  //     throw new NotInDBError(`User with username '${username}' not found`);
  //   }
  //   return user;
  // }
}
