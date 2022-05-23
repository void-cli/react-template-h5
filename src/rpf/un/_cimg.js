const path = require('path');
const fs = require('fs');
const childProc = require('child_process');

const npmRootPath = childProc.execSync('npm root -g', {
  encoding: 'utf-8'
});
console.log('npm 全局包路径', npmRootPath);
const imageminGlobalPath = path.resolve(npmRootPath.trim(), 'imagemin');
const mozjpegGlobalPath = path.resolve(
  npmRootPath.trim(),
  'imagemin-mozjpeg-mirror'
);
const pngquantGlobalPath = path.resolve(
  npmRootPath.trim(),
  'imagemin-pngquant-mirror'
);

function checkPkg(pkgPath) {
  const pkgName = path.basename(pkgPath);
  if (!fs.existsSync(pkgPath)) {
    console.log('缺少全局', pkgName);
    console.log('请先运行', `npm i -g ${pkgName}`);
    process.exit(1);
  }

  // 检查imagemin版本，8.0.0以上版本存在模块问题
  if (pkgName === 'imagemin') {
    const maxVersion = '8.0.0';
    const paths = `${pkgPath}/package.json`;
    const filePackage = fs.existsSync(paths)
      ? fs.readFileSync(paths, 'utf-8')
      : null;
    const packageDate = JSON.parse(filePackage);
    if (packageDate && packageDate.version >= maxVersion) {
      console.log(
        `当前imagemin版本：${packageDate.version} 过高，请运行‘npm i imagemin@7.0.1 -g’ 安装低版本`
      );
      process.exit(1);
    }
  }
}

checkPkg(imageminGlobalPath);
checkPkg(mozjpegGlobalPath);
checkPkg(pngquantGlobalPath);

const imagemin = require(imageminGlobalPath);
const mozjpeg = require(mozjpegGlobalPath);
const pngquant = require(pngquantGlobalPath);

function parseArgv(argv) {
  return argv.reduce((acc, item) => {
    if (/^--/.test(item)) {
      const kv = item.replace(/^--/, '').split('=');
      if (kv.length === 2) {
        const [kv0, kv1] = kv;
        acc[kv0] = kv1;
      }
    }
    return acc;
  }, {});
}

const args = parseArgv(process.argv);

if (!args.path) {
  console.log('缺少 path 参数，--path=path/to/images');
  process.exit(1);
}
if (path.isAbsolute(args.path)) {
  console.log('为了安全，path 参数必须是相对路径');
  process.exit(1);
}

const compressPath = path.resolve(process.cwd(), args.path);
console.log('开始压缩', compressPath, '的图片');

const targetDir = compressPath.replace(/\\/g, '/');

const sizeMapPath = path.resolve(process.cwd(), '.cimg_data');

function getPrevSizeMap() {
  console.log('开始读取 size 映射表', sizeMapPath);
  if (fs.existsSync(sizeMapPath)) {
    let data = {};
    try {
      const fileContent = fs.readFileSync(sizeMapPath);
      data = JSON.parse(fileContent);
    } catch (err) {
      console.log('读取数据文件出错', err.message);
    }
    return data;
  }
  return {};
}

function getSizeMapKey(src) {
  return path.relative(process.cwd(), src).replace(/\\/g, '/');
}

function getSizeMap(files) {
  return files.reduce((acc, item) => {
    const { size } = fs.statSync(item.sourcePath);
    acc[getSizeMapKey(item.sourcePath)] = `${size}`;
    return acc;
  }, {});
}

const prevSizeMap = getPrevSizeMap();

console.log('开始压缩...');
imagemin([`${targetDir}/**/*.{jpg,png}`], {
  plugins: [
    mozjpeg({
      quality: 75,
      progressive: false
    }),
    pngquant({
      quality: [0.8, 1]
    })
  ]
}).then(files => {
  let count = 0;
  const fileSizeMap = getSizeMap(files);

  files.forEach(item => {
    const { sourcePath } = item;
    const key = getSizeMapKey(sourcePath);
    if (prevSizeMap[key] === fileSizeMap[key]) {
      console.log('size 相同，忽略', sourcePath);
    } else {
      console.log('压缩', sourcePath);
      count += 1;
      fs.writeFileSync(sourcePath, item.data);
    }
  });

  console.log('更新 size 映射表', sizeMapPath);
  const nextSizeMap = getSizeMap(files);
  fs.writeFileSync(
    path.resolve(sizeMapPath),
    JSON.stringify(
      {
        ...prevSizeMap,
        ...nextSizeMap
      },
      null,
      2
    )
  );

  console.log(`压缩了 (${count} / ${files.length}) 张图片`);
});

/**
 * 压缩指定目录的图片文件
 *
 * 注意：
 * 1. 该模块没有任何导出，因为 typedoc 的限制，所以导出了个模块名称
 * 2. `un/_cimg.js` 依然存在，只是作为兼容保留，后续请使用 `cli/cimg.js`
 *
 * - 请使用 brick-cli，该命令已集成在 {@link https://gitlab.szzbmy.com/gz-demo/brick-cli 部署命令} 中
 *
 * 安装依赖，不要使用 cnpm：
 * ```bash
 * npm i -g imagemin@7.0.1 imagemin-mozjpeg-mirror imagemin-pngquant-mirror
 * ```
 *
 * 修改 package.json：
 * ```json
 * {
 *   "scripts": {
 *     "cimg": "node ./src/rpf/un/_cimg --path=./src/assets/"
 *   }
 * }
 * ```
 *
 * 在项目根目录中运行：
 * ```bash
 * npm run cimg
 * ```
 *
 * **注意：**
 * - 为了防止图片被多次压缩，每次运行都会在运行目录生成一个 `.cimg_data` 文件记录最后一次压缩后的文件大小，请不要删除，也不要添加到 `.gitignore`
 * - 只有本次运行时与最后一次运行时的文件大小不同的文件，才会被压缩
 */
module.exports = 'cimg';
