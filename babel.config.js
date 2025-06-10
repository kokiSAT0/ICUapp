export default {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
    // React の JSX 構文を解釈するためのプリセット
    '@babel/preset-react'
  ]
};
