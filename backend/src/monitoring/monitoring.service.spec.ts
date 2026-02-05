/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { getConnectionToken } from 'nest-knexjs';

import { ConsoleLoggerService } from '../logger/console-logger.service';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let knex: Knex;

  beforeEach(async () => {
    const knexMock = {
      raw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: getConnectionToken(),
          useValue: knexMock,
        },
        {
          provide: ConsoleLoggerService,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    knex = module.get<Knex>(getConnectionToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isHealthy', () => {
    it('should return true when database is accessible', async () => {
      jest.spyOn(knex, 'raw').mockResolvedValue(undefined);

      const result = await service.isHealthy();

      expect(result).toBe(true);
      expect(knex.raw).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database is not accessible', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(knex, 'raw').mockRejectedValue(error);

      const result = await service.isHealthy();

      expect(result).toBe(false);
      expect(knex.raw).toHaveBeenCalledWith('SELECT 1');
    });
  });
});
