/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */

import { asObject, asString } from './verify-type';

/**
 * 用于在金管家回流链接中替换掉原本的重定向地址。
 *
 * @example
 * ```js
 * urlInserter({
 *   origin:'https://als.cdn.lifeapp.pingan.com.cn/elis_smp_als_dmz/act-base/wx-extinfo/index.html?url=pars%3A%2F%2Fpars.pingan.com%2Fopen_url%3Furl%3Dhttps%253A%252F%252Fals.cdn.lifeapp.pingan.com.cn%252Felis_smp_als_dmz%252Fact-base%252Fsign-up%252Findex.html%253Faid%253D20190926191132%2526source%253Dshare%2526redirectUri%253Dhttps%25253A%25252F%25252Fsaas.killerwhale.cn%25252Fapproute%25252Ft%25252FBiwz11aY%26type%3Djssdk',
 *   querys: {
 *     s_oid: '123456'
 *   }
 * });
 *
 * // 输出：https://als.cdn.lifeapp.pingan.com.cn/elis_smp_als_dmz/act-base/wx-extinfo/index.html?url=pars%3A%2F%2Fpars.pingan.com%2Fopen_url%3Furl%3Dhttps%253A%252F%252Fals.cdn.lifeapp.pingan.com.cn%252Felis_smp_als_dmz%252Fact-base%252Fsign-up%252Findex.html%253Faid%253D20190926191132%2526source%253Dshare%2526redirectUri%253Dhttps%25253A%25252F%25252Fwww.baidu.com%26type%3Djssdk&s_oid=123456
 * ```
 *
 * @param {string} origin 原地址的例子（例如金管家回流地址）
 * @param {string} url 需要插入的地址
 * @param {Record<string, any>} querys 需要附带在最外层地址的参数,如{ s_oid:"123123" }
 * @return {string} 替换完毕的地址
 *
 */
function urlInserter({ origin, url, querys = {} } = {}) {
  asString(origin, 'origin参数需要传入一个字符串');
  asString(url, 'url参数需要传入一个字符串');
  asObject(url, 'querys参数需要传入一个对象');

  const encodedCount = encodeCounter(origin);
  if (encodedCount < 1) {
    throw new Error('原网址未编码');
  }

  const urlNeedToBeInserted = encodeUrl(url, encodedCount);
  const urlNeedToBeReplaced = getUrlNeedToBeReplaced(origin, encodedCount);
  let result = origin.replace(urlNeedToBeReplaced, urlNeedToBeInserted);
  result = addQuery(result, querys);
  return result;
}

function addQuery(url, querys) {
  const keys = Object.keys(querys);
  let result = url;
  if (keys.length <= 0) return result;
  for (const key of keys) {
    result += `&${key}=${querys[key]}`;
  }
  return result;
}

function encodeUrl(url, encodedCount) {
  let i = encodedCount;
  let tempUrl = url;
  while (i--) {
    tempUrl = encodeURIComponent(tempUrl);
  }
  return tempUrl;
}

function getUrlNeedToBeReplaced(origin, encodedCount) {
  // 编码1次
  if (encodedCount === 1) {
    return origin
      .match(new RegExp(`(=)http([\\s\\S]*?)(?=(&|(\\b)$))`))[0]
      .slice(1);
  }

  // 根据编码次数找出待替换地址的开头
  // 待替换地址的上一层的'25'的数量
  const amountOf25 = encodedCount - 2;
  const leftPad = (() => {
    let i = amountOf25;
    let res = '%';
    if (i <= 0) return `${res}3D`;
    while (i--) {
      res += '25';
    }
    return `${res}3D`;
  })();

  // 右端匹配语句不断增加'25'的数量找出待替换的地址
  let rightPad = '';
  if (amountOf25 < 1) {
    return origin
      .match(
        new RegExp(`(${leftPad})http([\\s\\S]*?)(?=(%${rightPad}26|(\\b)$))`)
      )[0]
      .replace(leftPad, '');
  }
  // 待替换的地址后的第一个编码过的 & 号或字符串末为其末尾，匹配长度最短的为待替换地址
  let i = amountOf25;
  let res;
  let temp;
  while (i--) {
    temp = origin.match(
      new RegExp(`(${leftPad})http([\\s\\S]*?)(?=(%${rightPad}26|(\\b)$))`)
    )[0];
    if (!res || temp.length < res.length) {
      res = temp;
    }
    rightPad += '25';
  }
  return res.replace(leftPad, '');
}
function encodeCounter(url) {
  let count = 0;
  function fn(url) {
    const decoded = decodeURIComponent(url);
    if (decoded !== url) {
      count++;
      fn(decoded);
    }
  }
  fn(url);
  return count;
}
export default urlInserter;
