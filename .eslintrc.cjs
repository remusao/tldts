module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
  ],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/comparison/**',
    '**/bench/**',
    '**/publicsuffix/**',
  ],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: { browser: true, node: true },
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
};
