const { getPlugin, pluginByName } = require('@craco/craco');

module.exports = {
  style: {
    postcss: {
      plugins: [require('./src/rpf/un/postcss-auto-bg-plugin')]
    }
  },
  webpack: {
    configure: config => {
      const getHtmlPlugin = getPlugin(
        config,
        pluginByName('HtmlWebpackPlugin')
      );
      if (getHtmlPlugin.isFound) {
        getHtmlPlugin.match.options.minify = false;
      }
      return config;
    }
  }
};
