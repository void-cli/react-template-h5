#!/usr/bin/env node
const chalk = require('chalk');
const shell = require('shelljs');
const childProc = require('child_process');
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

function parseArgv(argv) {
  return argv.reduce((acc, item) => {
    if (/^--/.test(item)) {
      const kv = item.replace(/^--/, '').split('=');
      if (kv.length === 2) {
        acc[kv[0]] = kv[1];
      }
    }
    return acc;
  }, {});
}

function fail(msg) {
  console.log(chalk.redBright('部署失败', msg));
  process.exit(0);
}

function runCharon(env, cb) {
  const charonProc = childProc.exec(`charon publish ${env}`, cb);
  charonProc.on('exit', () => {
    process.stdin.destroy();
  });
  process.stdin.pipe(charonProc.stdin);
  charonProc.stdout.pipe(process.stdout);
}

function checkGitStatus() {
  const gitStatusExec = shell.exec('git status --porcelain');
  if (gitStatusExec.code !== 0 || gitStatusExec.stdout.trim().length > 0) {
    fail('请先 commit 代码');
  }
}

function compressImgs() {
  const cimgExec = shell.exec('npm run cimg');
  if (cimgExec.code !== 0) {
    fail('压缩图片未完成');
  }

  shell.exec('git add .');
  shell.exec('git commit -m "compress images"');
}

function pushToGitRemote() {
  const gitPushExec = shell.exec('git push origin master');
  if (gitPushExec.code !== 0) {
    fail('自动 push 代码失败，请先同步远程仓库');
  }
}

function checkFileIntegrity() {
  const files = ['.env'];

  const status = files.reduce((acc, filename) => {
    if (!fs.existsSync(path.resolve(process.cwd(), filename))) {
      acc.push(`${filename} 文件不存在`);
    }
    return acc;
  }, []);

  if (status.length) {
    fail('\n' + status.join('\n'));
  }
}

const args = parseArgv(process.argv);

function main() {
  checkFileIntegrity();

  if (!args.env) {
    fail(`缺少 env 参数 --env=(test|temp|prod)`);
  }

  if (args.env !== 'temp') {
    checkGitStatus();
    compressImgs();
    pushToGitRemote();
  }

  const buildStrObj = {
    prod: `cross-env PUBLIC_URL=https://cdn2.h5no1.com/${pkg.name} REACT_APP_VCONSOLE=false REACT_APP_CONFIG_ENV=prod npm run build`,
    test: 'cross-env REACT_APP_CONFIG_ENV=test npm run build',
    temp: 'cross-env REACT_APP_CONFIG_ENV=dev npm run build'
  };

  const buildExec = shell.exec(buildStrObj[args.env]);
  if (buildExec.code !== 0) {
    fail('构建未完成');
  }

  runCharon(args.env);
}

main();
