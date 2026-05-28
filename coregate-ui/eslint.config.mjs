import js from '@eslint/js';
import nextPlugin from 'eslint-config-next';
import globals from 'globals';

const config = [
  {
    ignores: [
      'components/ui/**',
      'hooks/**',
      'app/layout.tsx',
      'lib/i18n/translations.ts',
    ],
  },
  js.configs.recommended,
  ...nextPlugin,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
