import eslintPluginReact from 'eslint-plugin-react';

export default [
  {
    // js だけでなく ts も対象にするため拡張子を追加
    files: ['**/*.{js,jsx,ts,tsx}'],
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
