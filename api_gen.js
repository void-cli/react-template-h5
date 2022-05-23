const pkg = require('./package.json');
const url = `https://${pkg.name.replace(
  /-h5$/,
  ''
)}.test.h5no1.com/api/docs/sdk`;

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiDirPath = path.resolve(process.cwd(), 'src/api');

axios
  .get(url)
  .then(res => {
    if (res.data.ok) {
      const { base, baseType } = res.data.result;
      fs.writeFileSync(path.resolve(apiDirPath, 'api.base.js'), base);
      fs.writeFileSync(path.resolve(apiDirPath, 'api.base.d.ts'), baseType);
    } else {
      console.log('API 生成出错', JSON.stringify(res.data));
    }
  })
  .catch(err => {
    console.log('API 生成出错', err.message);
  });
