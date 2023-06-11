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
export function mockSelectQueryBuilder<T extends ObjectLiteral>(
  returnValue: T | T[] | null,
): SelectQueryBuilder<T> {
  const mockedQueryBuilder: SelectQueryBuilder<T> = Mock.of<
    SelectQueryBuilder<T>
  >({
    where: (where) => {
      if (typeof where === 'function') {
        where(mockedQueryBuilder);
      }
      return mockedQueryBuilder;
    },
    andWhere: (where) => {
      if (typeof where === 'function') {
        where(mockedQueryBuilder);
      }
      return mockedQueryBuilder;
    },
    subQuery: () => mockedQueryBuilder,
    select: () => mockedQueryBuilder,
    from: <M extends ObjectLiteral>() => mockSelectQueryBuilder<M>(null),
    innerJoin: () => mockedQueryBuilder,
    leftJoinAndSelect: () => mockedQueryBuilder,
    getQuery: () => '',
    getOne: () =>
      Promise.resolve(
        Array.isArray(returnValue) ? returnValue[0] : returnValue,
      ),
    orWhere: (where) => {
      if (typeof where === 'function') {
        where(mockedQueryBuilder);
      }
      return mockedQueryBuilder;
    },
    setParameter: () => mockedQueryBuilder,
    getMany: () => {
      if (!returnValue) {
        return Promise.resolve([]);
      }
      return Promise.resolve(
        Array.isArray(returnValue) ? returnValue : [returnValue],
      );
    },
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
  returnValue: T | T[] | null,
): SelectQueryBuilder<T> {
  const selectQueryBuilder = mockSelectQueryBuilder<T>(returnValue);
  jest
    .spyOn(repository, 'createQueryBuilder')
    .mockImplementation(() => selectQueryBuilder);
  return selectQueryBuilder;
}
