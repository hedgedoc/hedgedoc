/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as ConnectTypeormModule from 'connect-typeorm';
import { TypeormStore } from 'connect-typeorm';
import { Mock } from 'ts-mockery';
import { Repository } from 'typeorm';

import { DatabaseType } from '../config/database-type.enum';
import { DatabaseConfig } from '../config/database.config';
import { Session } from '../users/session.entity';
import { SessionService } from './session.service';

jest.mock('cookie');
jest.mock('cookie-signature');

describe('SessionService', () => {
  let mockedTypeormStore: TypeormStore;
  let mockedSessionRepository: Repository<Session>;
  let databaseConfigMock: DatabaseConfig;
  let typeormStoreConstructorMock: jest.SpyInstance;
  let sessionService: SessionService;

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    mockedTypeormStore = Mock.of<TypeormStore>({
      connect: jest.fn(() => mockedTypeormStore),
    });
    mockedSessionRepository = Mock.of<Repository<Session>>({});
    databaseConfigMock = Mock.of<DatabaseConfig>({
      type: DatabaseType.SQLITE,
    });

    typeormStoreConstructorMock = jest
      .spyOn(ConnectTypeormModule, 'TypeormStore')
      .mockReturnValue(mockedTypeormStore);

    sessionService = new SessionService(
      mockedSessionRepository,
      databaseConfigMock,
    );
  });

  it('creates a new TypeormStore on create', () => {
    expect(typeormStoreConstructorMock).toBeCalledWith({
      cleanupLimit: 2,
      limitSubquery: true,
    });
    expect(mockedTypeormStore.connect).toBeCalledWith(mockedSessionRepository);
    expect(sessionService.getTypeormStore()).toBe(mockedTypeormStore);
  });
});
