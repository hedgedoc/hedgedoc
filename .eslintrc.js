module.exports = {
  'root': true,
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'tsconfigRootDir': __dirname,
    'project': ['./tsconfig.json'],
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'extends': [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  'env': {
    'node': true
  },
  'rules': {
    // at some point all of these should return to their default "error" state
    // but right now, this is not a good choice, because too many places are
    // wrong.
    'import/first': ['warn'],
    'indent': ['warn'],
    'no-console': ['warn'],
    'no-multiple-empty-lines': ['warn'],
    'no-multi-spaces': ['warn'],
    'object-curly-spacing': ['warn'],
    'one-var': ['warn'],
    'quotes': ['warn'],
    'semi': ['warn'],
    'space-infix-ops': ['warn']
  }
}
