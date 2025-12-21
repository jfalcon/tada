import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactDom from 'eslint-plugin-react-dom'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactX from 'eslint-plugin-react-x'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    // intentionally opted for strict rules
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactDom.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs['recommended-typescript'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // enable type-aware rules for both app sources and tooling files
        project: ['./tsconfig.app.json', './tsconfig.node.json']
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: ['./tsconfig.app.json'] },
        alias: {
          map: [['@/', './src']],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
        }
      }
    },
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
    }
  },
])
