const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1890ff',
              '@body-background': '#1e1e1e',
              '@component-background': '#2d2d2d',
              '@text-color': '#f5f5f5',
              '@text-color-secondary': '#bfbfbf',
              '@border-color-base': '#434343',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
