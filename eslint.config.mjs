import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'src/server/public/abecms/vendors/**',
      'src/server/public/abecms/libs/**',
      '**/*-compiled.js',
    ],
  },
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-redeclare': 'warn',
      'no-unreachable': 'warn',
      'no-mixed-spaces-and-tabs': 'warn',
      'no-self-assign': 'warn',
      'no-cond-assign': 'warn',
      'no-case-declarations': 'warn',
      'no-dupe-class-members': 'warn',
      'no-empty': 'warn',
      'valid-typeof': 'warn',
      'no-control-regex': 'warn',
      'no-useless-escape': 'warn',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          bracketSpacing: false,
          semi: false,
        },
      ],
    },
  },
]
