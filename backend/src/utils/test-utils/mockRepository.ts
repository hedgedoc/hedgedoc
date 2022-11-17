/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/*
import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsWhere,
  InsertResult,
  ObjectID,
  QueryRunner,
  RemoveOptions,
  Repository,
  SaveOptions,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

class MockRepository<T> implements Repository<T> {

  entities: T[]

  createQueryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): SelectQueryBuilder<T> {
    new SelectQueryBuilder()
    //return super.createQueryBuilder(alias, queryRunner);
  }
  find(options?: FindManyOptions<T>): Promise<T[]> {
    //return super.find(options);
  }

  clear(): Promise<void> {
    return Promise.resolve(undefined);
  }

  count(options: FindManyOptions<T> | undefined): Promise<number> {
    return Promise.resolve(0);
  }

  countBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number> {
    return Promise.resolve(0);
  }

  create(): T {
    return undefined;
  }

  decrement(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    return Promise.resolve(undefined);
  }

  delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return Promise.resolve(undefined);
  }

  extend<CustomRepository>(
    custom: CustomRepository & ThisType<Repository<T> & CustomRepository>,
  ): Repository<T> & CustomRepository {
    return undefined;
  }

  findAndCount(
    options: FindManyOptions<T> | undefined,
  ): Promise<[T[], number]> {
    return Promise.resolve([[], 0]);
  }

  findAndCountBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<[T[], number]> {
    return Promise.resolve([[], 0]);
  }

  findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
    return Promise.resolve([]);
  }

  findByIds(ids: any[]): Promise<T[]> {
    return Promise.resolve([]);
  }

  findOne(options: FindOneOptions<T>): Promise<T | null> {
    return Promise.resolve(undefined);
  }

  findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T | null> {
    return Promise.resolve(undefined);
  }

  findOneById(id: number | string | Date | ObjectID): Promise<T | null> {
    return Promise.resolve(undefined);
  }

  findOneByOrFail(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T> {
    return Promise.resolve(undefined);
  }

  findOneOrFail(options: FindOneOptions<T>): Promise<T> {
    return Promise.resolve(undefined);
  }

  getId(entity: T): any {}

  hasId(entity: T): boolean {
    return false;
  }

  increment(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ): Promise<UpdateResult> {
    return Promise.resolve(undefined);
  }

  insert(
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): Promise<InsertResult> {
    return Promise.resolve(undefined);
  }

  readonly manager: EntityManager;

  merge(mergeIntoEntity: T, entityLikes: DeepPartial<T>): T {
    return undefined;
  }

  get metadata(): import('..').EntityMetadata {
    return undefined;
  }

  preload(entityLike: DeepPartial<T>): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  query(query: string, parameters: any[] | undefined): Promise<any> {
    return Promise.resolve(undefined);
  }

  readonly queryRunner: QueryRunner;

  recover<T>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]> {
    return Promise.resolve([]);
  }

  remove(entities: T[], options: RemoveOptions | undefined): Promise<T[]> {
    return Promise.resolve([]);
  }

  restore(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    return Promise.resolve(undefined);
  }

  save<T>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]> {
    return Promise.resolve([]);
  }

  softDelete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    return Promise.resolve(undefined);
  }

  softRemove<T>(
    entities: T[],
    options: SaveOptions & { reload: false },
  ): Promise<T[]> {
    return Promise.resolve([]);
  }

  readonly target: EntityTarget<T>;

  update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return Promise.resolve(undefined);
  }

  upsert(
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<InsertResult> {
    return Promise.resolve(undefined);
  }
}
*/
