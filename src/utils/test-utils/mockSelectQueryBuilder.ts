/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

/**
 * Mocks a {@link SelectQueryBuilder} that returns a given entity.
 *
 * @param returnValue The entity to return
 * @return The mocked query builder
 */
export function mockSelectQueryBuilder<T>(
  returnValue: T | null,
): SelectQueryBuilder<T> {
  const mockedQueryBuilder: SelectQueryBuilder<T> = Mock.of<
    SelectQueryBuilder<T>
  >({
    where: () => mockedQueryBuilder,
    andWhere: () => mockedQueryBuilder,
    leftJoinAndSelect: () => mockedQueryBuilder,
    getOne: () => Promise.resolve(returnValue),
    orWhere: () => mockedQueryBuilder,
    setParameter: () => mockedQueryBuilder,
  });
  return mockedQueryBuilder;
}

/**
 * Mocks an {@link SelectQueryBuilder} and injects it into the given {@link Repository}.
 *
 * @param repository The repository whose query builder function should be mocked
 * @param returnValue The value that should be found by the query builder
 * @return The mocked query builder
 * @see mockSelectQueryBuilder
 */
export function mockSelectQueryBuilderInRepo<T extends ObjectLiteral>(
  repository: Repository<T>,
  returnValue: T | null,
): SelectQueryBuilder<T> {
  const selectQueryBuilder = mockSelectQueryBuilder(returnValue);
  jest
    .spyOn(repository, 'createQueryBuilder')
    .mockImplementation(() => selectQueryBuilder);
  return selectQueryBuilder;
}
