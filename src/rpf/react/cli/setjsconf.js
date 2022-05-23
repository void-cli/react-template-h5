const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(process.cwd(), './package.json');
const jsConfPath = path.resolve(process.cwd(), './jsconfig.json');

const config = `
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
`;

if (!fs.existsSync(pkgPath)) {
  console.log('package.json 不存在，请在项目根目录中运行');
} else {
  fs.writeFileSync(jsConfPath, config.trim());
}

/**
 * 生成 create-react-app 项目的 jsconfig.json 配置，提高开发体验
 *
 * 请使用 brick-cli，已有该配置 https://gitlab.szzbmy.com/gz-demo/brick-cli
 *
 * 在项目根目录中运行
 *
 * ```bash
 * node @/src/rpf/react/setjsconf.js
 * ```
 */
module.exports = 'react/setjsconf';
