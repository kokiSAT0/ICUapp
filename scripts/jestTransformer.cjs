const { transform } = require('sucrase');

module.exports = {
  process(src, filename) {
    const { code, sourceMap } = transform(src, {
      transforms: ['typescript', 'imports', 'jsx'],
      filePath: filename,
    });
    return { code, map: sourceMap };
  },
};
