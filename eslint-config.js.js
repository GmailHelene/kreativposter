// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier', // Må være sist for å overstyre andre konfigurasjoner
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Generelle regler
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-alert': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // React-spesifikke regler
    'react/prop-types': 'off', // Deaktiver prop-types ettersom vi bruker funktionelle komponenter
    'react/react-in-jsx-scope': 'off', // Ikke nødvendig i nyere versjoner av React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import-regler
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    
    // Tilgjengelighetsregler som kan være for strenge i visse situasjoner
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
  },
  // Spesialregler for produksjonsmiljø
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      excludedFiles: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*'],
      env: {
        jest: false,
      },
      rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      },
    },
  ],
};
