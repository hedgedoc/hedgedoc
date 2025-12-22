/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Tracker } from 'knex-mock-client';

interface JoinDefinition {
  joinTable: string;
  otherTable?: string;
  keyLeft: string;
  keyRight?: string;
}

/**
 * Pre-registers a mocked SELECT SQL query for the tracker db.
 * When the tested method runs a matching query, the pre-registered response
 * value will be returned and the query will be stored in the tracker's history.
 *
 * @param tracker The mock db tracker
 * @param variables A list of selected database columns
 * @param table The table from which data is selected
 * @param where Either a list of
 * @param returnValue
 * @param joins
 */
export function mockSelect(
  tracker: Tracker,
  variables: string[],
  table: string,
  where: string | string[],
  returnValue: unknown = [],
  joins: JoinDefinition[] = [],
): void {
  const selection =
    variables.length > 0 ? variables.map((v) => `"${v}"`).join(', ') : '\\*';
  const joinStatement =
    joins.length > 0
      ? joins
          .map(({ joinTable, otherTable, keyLeft, keyRight }) => {
            const leftStatement = `"${joinTable}"."${keyLeft}"`;
            const rightStatement = `"${otherTable ?? table}"."${keyRight ?? keyLeft}"`;
            return `\\w+ join "${joinTable}" on (:?${leftStatement}|${rightStatement}) = (:?${leftStatement}|${rightStatement})`;
          })
          .join(' ') + ' '
      : '';
  const whereClause = Array.isArray(where)
    ? where.map((w) => `"${w}"`).join('.*')
    : `"${where}"`;
  const regex = `select(?: distinct)? ${selection} from "${table}" ${joinStatement}where .*${whereClause}.*`;
  const selectRegex = new RegExp(regex);
  tracker.on.select(selectRegex).responseOnce(returnValue);
}

export function mockInsert(
  tracker: Tracker,
  table: string,
  variables: string[],
  returnValue: unknown = null,
): void {
  const insertRegex = new RegExp(
    `insert into "${table}" \\(${variables.map((v) => `"${v}"`).join(', ')}\\) values .*`,
  );
  tracker.on.insert(insertRegex).responseOnce(returnValue);
}

export function mockUpdate(
  tracker: Tracker,
  table: string,
  variables: string[],
  where: string,
  numberUpdatedEntries: number | unknown[] = 1,
): void {
  const regex = `update "${table}" set ${variables.map((v) => `"${v}" = (?:CURRENT_TIMESTAMP|\\$\\d+)`).join(', ')} where.*${where}.*`;
  const updateRegex = new RegExp(regex);
  tracker.on.update(updateRegex).responseOnce(numberUpdatedEntries);
}

export function mockDelete(
  tracker: Tracker,
  table: string,
  wheres: string[],
  numberDeletedEntries: number | unknown[] = 1,
): void {
  const deleteRegex = new RegExp(
    `delete from "${table}" where ${wheres.map((w) => `"${w}"`).join('.*')}.*`,
  );
  tracker.on.delete(deleteRegex).responseOnce(numberDeletedEntries);
}

/**
 * Pre-registers a mocked SELECT SQL query for the tracker db.
 * When the tested method runs a matching query, the pre-registered response
 * value will be returned and the query will be stored in the tracker's history.
 *
 * @param method The SQL method used for the query, e.g. 'select' or 'insert'
 * @param tracker The mock db tracker
 * @param query A regex matching the query to mock
 * @param returnValue The response value to return for the query
 */
export function mockQuery(
  method: 'select' | 'insert' | 'update' | 'delete',
  tracker: Tracker,
  query: RegExp,
  returnValue: unknown = [],
): void {
  console.debug(query);
  tracker.on[method](query).responseOnce(returnValue);
}
