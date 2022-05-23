/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
const postcss = require('postcss');
const path = require('path');
const imagesize = require('image-size');

function hasProp(name, rule) {
  return rule.some(i => i.prop === name);
}

function vw(px, base = 750, unit = true) {
  return (Math.round(px) / base) * 100 + (unit ? 'vw' : '');
}

function getImgSysPath(baseUrl, filePath, root) {
  if (/^\./.test(filePath)) {
    return path.resolve(path.dirname(root.source.input.file), filePath);
  }
  /* 
    ~@/path/to/img.png (vue-cli alias)
    ~path/to/img.png (cra with jsconfig)
    =>
    path/to/img.png
   */
  const fixedPath = filePath.replace(/^~?@?\/?/, '');
  return path.resolve(process.cwd(), baseUrl, fixedPath);
}

function getBgUrlValue(str) {
  return str
    .trim()
    .replace(/^url\(['"]?/, '')
    .replace(/['"]?\)$/, '');
}

/**
 * postcss 自动背景图插件，对所有声明了 `background-image: url(<图片相对路径>)` 的选择器，自动加上 `background-repeat:no-repeat; background-size:100%; width:<图片宽度vw>; height:<图片高度vw>;`，可以和任意预处理器(CSS, sass, scss, less, stylus, CSS Modules ...)结合使用
 *
 * 请使用 brick-cli，已配置该插件 https://gitlab.szzbmy.com/gz-demo/brick-cli
 *
 * `styled-components` 用户请直接使用 https://www.npmjs.com/package/autobg.macro
 *
 *
 * ```css
 * .my-sprite {
 *   // 路径可以是
 *   // ./path/to/img.png
 *   // ../path/to/img.png
 *   // ~path/to/img.png (cra with jsconfig.json)
 *   // ~@/path/to/img.png (@vue/cli default alias)
 *   background-image: url('./assets/images/a.png');
 * }
 * ```
 * 编译之后会变成:
 * ```css
 * // 假设图片尺寸是 750px * 750px
 * .my-sprite {
 *   background-image: url('./assets/images/a.png');
 *   background-repeat: no-repeat;
 *   background-size: 100%;
 *   width: 100vw;
 *   height: 100vw;
 * }
 * ```
 *
 * 如果需要对自动生成的样式进行调整，直接在选择器代码中声明即可，且不用担心声明顺序:
 * ```css
 * .my-sprite {
 *   color: red;
 *   background-size: 50%; // 可以写在 background-image 前面或后面
 *   background-image: url('./assets/images/a.png');
 * }
 * ```
 *
 * ## create-react-app 项目
 *
 * 安装开发依赖，为了自定义配置，还需要安装 `craco`
 *
 * ```bash
 * npm i -D craco image-size
 * ```
 * 修改 package.json
 *
 * ```json
 * {
 *   "scripts": {
 *     "start": "craco start",
 *     "build": "craco build"
 *   }
 * }
 * ```
 * 项目根目录添加 `craco.config.js`
 *
 * craco 使用拓展方式修改配置，不需要再次引入原本已有的插件，例如 `autoprefixer`
 *
 * ```js
 * module.exports = {
 *   style: {
 *     postcss: {
 *       plugins: [require('./src/rpf/un/postcss-auto-bg-plugin')]
 *     }
 *   }
 * };
 * ```
 *
 * ## @vue/cli 项目
 *
 * 安装开发依赖
 *
 * ```bash
 * npm i -D image-size
 * ```
 *
 * 修改 vue.config.js
 *
 * 修改 postcss.plugins 需要注意
 *
 * - 引入默认配置中原本已有的插件 `autoprefixer`，否则会丢失此功能
 * - **不要**再次手动运行 `npm i -D autoprefixer`，否则会有版本问题
 *
 * ```js
 * module.exports = {
 *   css: {
 *     loaderOptions: {
 *       postcss: {
 *         plugins: [
 *           require('autoprefixer'),
 *           require('./src/rpf/un/postcss-auto-bg-plugin')
 *         ]
 *       }
 *     }
 *   }
 * };
 * ```
 * **与预处理器实现(Mixin 等)的比较**
 * - 代码中使用的依然是标准的 CSS 语法，没有 mixin 带来的抽象概念，零学习成本
 * - 需要调整样式的时候，相同的属性不会有多次声明，不用考虑属性顺序问题，且编译后的 CSS 文件更小
 * - 自动化生成代码，不需要通过调用 mixin 来完成功能，而是自动检测代码
 * - 跨平台开发的兼容性，某些预处理器，例如 stylus 在路径处理上存在跨平台不一致现象
 *
 */
const postcssAutoBGPlugin = postcss.plugin(
  'postcss-auto-bg',
  ({ baseUrl = './src', vwBase = 750 } = {}) =>
    root => {
      root.walkRules(rule => {
        rule.walkDecls('background-image', decl => {
          if (/^url\(/.test(decl.value)) {
            const bgUrlValue = getBgUrlValue(decl.value);
            if (!/^http/.test(bgUrlValue) && !/^data:/.test(bgUrlValue)) {
              const size = imagesize(getImgSysPath(baseUrl, bgUrlValue, root));
              const hasBgRepeat = hasProp('background-repeat', rule);
              const hasBgSize = hasProp('background-size', rule);
              const hasWidth = hasProp('width', rule);
              const hasHeight = hasProp('height', rule);

              if (!hasBgRepeat) {
                rule.append({
                  prop: 'background-repeat',
                  value: 'no-repeat'
                });
              }
              if (!hasBgSize) {
                rule.append({
                  prop: 'background-size',
                  value: '100%'
                });
              }
              if (!hasWidth) {
                rule.append({
                  prop: 'width',
                  value: vw(size.width, vwBase)
                });
              }
              if (!hasHeight) {
                rule.append({
                  prop: 'height',
                  value: vw(size.height, vwBase)
                });
              }
            }
          }
        });
      });
    }
);

module.exports = postcssAutoBGPlugin;
