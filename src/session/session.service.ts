/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import { Repository } from 'typeorm';

import { DatabaseType } from '../config/database-type.enum';
import databaseConfiguration, {
  DatabaseConfig,
} from '../config/database.config';
import { Session } from '../users/session.entity';

@Injectable()
export class SessionService {
  private readonly typeormStore: TypeormStore;

  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    @Inject(databaseConfiguration.KEY)
    private dbConfig: DatabaseConfig,
  ) {
    this.typeormStore = new TypeormStore({
      cleanupLimit: 2,
      limitSubquery: dbConfig.type !== DatabaseType.MARIADB,
    }).connect(sessionRepository);
  }

  getTypeormStore(): TypeormStore {
    return this.typeormStore;
  }
}
