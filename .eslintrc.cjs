module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'], // Crucial for type-aware rules
    // tsconfigRootDir: __dirname, // Optional: useful if tsconfigs aren't at root
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Recommended TS rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Stricter type-aware rules
    'plugin:react/recommended', // Recommended React rules
    'plugin:react/jsx-runtime', // For the new JSX Transform
    'plugin:react-hooks/recommended', // Recommended React Hooks rules
    'plugin:jsx-a11y/recommended', // Recommended accessibility rules
    // Add 'eslint-config-prettier' here ONLY if installed to disable conflicting formatting rules
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn on unused vars, allowing underscore prefix
    '@typescript-eslint/no-explicit-any': 'warn', // Warn against using 'any' type
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow inferred return types for functions for now

    // React specific rules
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript for type checking
    'react/react-in-jsx-scope': 'off', // Handled by the new JSX Transform

    // React Hooks rules (already covered by recommended, but explicit for emphasis)
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // General Rules (can add more specific project preferences here)
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
    // Add any specific project rule overrides here. Example:
    // 'jsx-a11y/anchor-is-valid': 'off', // If using a router that handles link behavior differently
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.vercel/',
    '.vite/', // Vite cache directory
    '*.config.js', // Ignore JS config files
    '*.config.cjs', // Ignore CJS config files (like this one)
    'coverage/', // Ignore coverage reports
    'public/', // Usually don't need linting for static assets
  ],
};