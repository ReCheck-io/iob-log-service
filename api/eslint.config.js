const eslint = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  // Global ignores configuration (must be first and only contain ignores)
  {
    ignores: [
      // Generated files and build artifacts
      '**/.azle/**',
      '**/.dfx/**',
      '**/dfx-declarations/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/target/**',
      '**/*.wasm',
      '**/*.wasm.gz',
      '**/main.js',
      // Certificate files
      'certs/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Prevent usage of variables before they are defined
      'no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: true },
      ],

      // Enforce consistent quote style (double quotes to match Prettier)
      quotes: ['error', 'double', { avoidEscape: true }],

      // Require semicolons
      semi: ['error', 'always'],

      // Disallow unused variables with more flexibility
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // CommonJS specific rules
      'no-undef': 'error',
    },
  },
  prettierConfig,
];
