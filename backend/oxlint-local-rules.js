/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const loggerFunctions = ['error', 'log', 'warn', 'debug', 'verbose'];

/**
 * Ensures that logger context strings match the method name where they're called.
 * This helps with debugging by ensuring log context accurately reflects the source.
 * 
 * Example of correct usage:
 *   class ExampleService {
 *     exampleMethod() {
 *       this.logger.log('Hello', 'exampleMethod');
 *     }
 *   }
 * 
 * Example of incorrect usage:
 *   class ExampleService {
 *     exampleMethod() {
 *       this.logger.log('Hello', 'wrongName');
 *     }
 *   }
 */
const correctLoggerContextRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure logger context strings match the method name where they are called',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      wrongContext: "Used wrong context in log statement. Expected '{{expected}}', got '{{actual}}'",
    },
  },
  create: function (context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      CallExpression: function (node) {
        // Check if this is a logger call: this.logger.log/error/warn/debug/verbose(...)
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'MemberExpression' &&
          node.callee.object.property.name === 'logger' &&
          loggerFunctions.includes(node.callee.property.name) &&
          node.arguments &&
          node.arguments.length === 2
        ) {
          const contextArg = node.arguments[1];

          // Only check string literal contexts
          if (contextArg.type !== 'Literal' || typeof contextArg.value !== 'string') {
            return;
          }

          const usedContext = contextArg.value;
          let correctContext = 'undefined';

          // Walk up the AST to find the enclosing method
          const ancestors = sourceCode.getAncestors
            ? sourceCode.getAncestors(node)
            : context.getAncestors();
          for (let index = ancestors.length - 1; index >= 0; index--) {
            const ancestor = ancestors[index];
            if (ancestor.type === 'MethodDefinition' && ancestor.key) {
              correctContext = ancestor.key.name || ancestor.key.value;
              break;
            }
          }

          // Report if context doesn't match
          if (usedContext !== correctContext) {
            context.report({
              node: contextArg,
              messageId: 'wrongContext',
              data: {
                expected: correctContext,
                actual: usedContext,
              },
              fix: function (fixer) {
                return fixer.replaceText(contextArg, `'${correctContext}'`);
              },
            });
          }
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: 'hedgedoc-local',
    version: '1.0.0',
  },
  rules: {
    'correct-logger-context': correctLoggerContextRule,
  },
};

// Export CommonJS for ESLint, ESM for oxlint
if (typeof module !== 'undefined' && module.exports) {
  module.exports = plugin;
}
export default plugin;
