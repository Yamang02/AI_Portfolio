module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'plugin:storybook/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // FSD 아키텍처 import 규칙
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: '@shared/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@design-system/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@main/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@admin/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    // 상대 경로 import 제한 (같은 레이어 내부는 허용)
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../../*', '../../../../*', '../../../../../*'],
            message: 'Deep relative imports are not allowed. Use path aliases instead (@main, @admin, @shared, @design-system).',
          },
          {
            group: [
              '@main/pages/*/**',
              '@main/widgets/*/**',
              '@main/features/*/**',
              '@main/entities/*/**',
              '@admin/pages/*/**',
              '@admin/widgets/*/**',
              '@admin/features/*/**',
              '@admin/entities/*/**',
            ],
            message: 'Do not import slice internals through aliases. Import via slice public API (e.g. @main/features/foo) and use relative paths only inside the same slice.',
          },
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};

