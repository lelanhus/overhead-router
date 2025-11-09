import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import functional from 'eslint-plugin-functional';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', 'examples', 'benchmark'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
      'sonarjs': sonarjs,
      'functional': functional,
    },
    rules: {
      // ESLint recommended rules
      ...tseslint.configs['recommended'].rules,
      ...tseslint.configs['recommended-type-checked'].rules,

      // TypeScript Strict Rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],

      // Code Complexity Rules
      'complexity': ['error', 15], // Cyclomatic complexity
      'max-depth': ['error', 4], // Nesting depth
      'max-lines': ['error', 300], // File length
      'max-lines-per-function': ['error', 50], // Function length
      'max-params': ['error', 4], // Parameter count
      'max-statements': ['error', 30], // Statements per function

      // SonarJS - Cognitive Complexity & Code Quality
      'sonarjs/cognitive-complexity': ['error', 15], // Cognitive complexity (strict)
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }], // Warn on 5+ duplicate strings
      'sonarjs/no-identical-functions': 'warn', // Detect copy-paste code
      'sonarjs/prefer-immediate-return': 'warn', // Avoid unnecessary variables
      'sonarjs/no-collapsible-if': 'warn', // Simplify nested ifs
      'sonarjs/no-nested-template-literals': 'off', // Allow for buildPath usage

      // Functional Programming (aligns with CLAUDE.md immutability principles)
      'functional/no-let': 'warn', // Prefer const (3 justified lets exist)
      'functional/immutable-data': 'off', // Too strict, conflicts with array methods
      'functional/prefer-readonly-type': 'warn', // Encourage readonly arrays/objects
      'functional/no-loop-statements': 'off', // Justified loops exist
      'functional/no-throw-statements': 'off', // Used for control flow (redirect)

      // Import Rules
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      'import/no-unresolved': 'off',

      // General Rules
      'no-console': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      // Relax complexity rules for tests
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'complexity': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'functional/no-let': 'off',
    },
  },
  prettierConfig,
];
