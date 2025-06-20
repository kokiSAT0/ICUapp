// babel.config.js  ★書き換え後
/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache(true);                 // ビルドキャッシュ
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
        },
      ],
    ],
  };
};
