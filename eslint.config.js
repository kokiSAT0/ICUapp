import eslintPluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    plugins: {
      react: eslintPluginReact
    },
    rules: {
      'react/react-in-jsx-scope': 'off'
    }
  }
];
