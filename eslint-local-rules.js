/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use strict';

const loggerFunctions = ['error', 'log', 'warn', 'debug', 'verbose'];

module.exports = {
  'correct-logger-context': {
    meta: {
      fixable: 'code',
      type: 'problem',
      docs: {
        recommended: true,
      },
      schema: [],
    },
    create: function (context) {
      return {
        CallExpression: function (node) {
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'MemberExpression' &&
            node.callee.object.property.name === 'logger' &&
            loggerFunctions.includes(node.callee.property.name) &&
            !!node.arguments &&
            node.arguments.length === 2
          ) {
            const usedContext = node.arguments[1].value;
            let correctContext = 'undefined';
            const ancestors = context.getAncestors();
            for (let index = ancestors.length - 1; index >= 0; index--) {
              if (ancestors[index].type === 'MethodDefinition') {
                correctContext = ancestors[index].key.name;
                break;
              }
            }
            if (usedContext !== correctContext) {
              context.report({
                node: node,
                message: `Used wrong context in log statement`,
                fix: function (fixer) {
                  return fixer.replaceText(
                    node.arguments[1],
                    `'${correctContext}'`
                  );
                },
              });
            }
          }
        },
      };
    },
  },
  'no-typeorm-equal': {
    meta: {
      type: 'problem',
      fixable: 'code',
      messages: {
        noEqual:
          'TypeORMs Equal constructor is buggy and therefore not allowed.',
      },
    },
    create: function (context) {
      return {
        Identifier: function (node) {
          if (node.name === 'Equal' && node.parent.type === 'CallExpression') {
            context.report({
              node: node,
              messageId: 'noEqual',
              fix: function (fixer) {
                return fixer.replaceText(
                  node.parent,
                  `{ id: ${node.parent.arguments[0].name}.id }`
                );
              },
            });
          }
        },
      };
    },
  },
};
