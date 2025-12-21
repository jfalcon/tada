import { FlatCompat } from '@eslint/eslintrc';

// import.meta.dirname is available after Node.js v20.11.0
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// note, only disallow barrel imports for MUI since it's a large library
const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off', // too strict
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'arrow-parens': ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'max-len': ['warn', {
        code: 100,
        ignoreComments: false,
        ignorePattern: '^\\s*//',
        ignoreRegExpLiterals: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true
      }],
      'no-alert': 'error',
      'no-console': ['warn', { allow: ['error', 'info', 'warn', 'table'] }],
      'no-debugger': 'error',
      quotes: ['warn', 'single', { avoidEscape: true }],
      semi: 'warn', // account for the AST
    },
  }),
];

export default eslintConfig;
