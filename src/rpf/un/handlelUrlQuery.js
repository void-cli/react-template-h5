/* eslint-disable import/no-extraneous-dependencies */
import qs from 'qs';

// 用于过滤掉不需要的参数
function omit(names, obj) {
  const result = {};
  const index = {};
  let idx = 0;
  const len = names.length;

  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }
  Object.keys(obj).forEach(prop => {
    if (!Object.prototype.hasOwnProperty.call(index, prop)) {
      result[prop] = obj[prop];
    }
  });
  return result;
}

/**
 * @des 返回url上指定的参数，如不指定，则返回所有的参数
 * 
  * #### 使用场景
 * 由于 vue-router 在 hash 模式下，通过 push 或者 replace 跳转路由并带查询参数时候或在一些特殊情况下，链接上参数会加到/#后面，类似 `https://xxx.com/#/page?id=1&pageId=677888`, 此时使用 window.location.search 或者是 rpf 的 getQuery 都获取不到 hash 问号后面的参数。
 * 所以开发这一个插件，可用来获取链接参数
 *

 * **示例**
 * @example
 * ```js
 * import { getUrlQuery } from './rpf/handlelUrlQuery';
 * // 假设页面为 https://new2.h5no1.com/?a=1&b=2
 * getUrlQuery(); // { a: '1', b: '2' }
 * getUrlQuery('a'); // 1
 * getUrlQuery('c'); // ''
 * ```
 * 

 * @param { string } name 指定参数名
 * @param { string } url 指定的链接
 * @return {Record<string, string | number>}} url上指定的参数
 *
 */
function getUrlQuery(name, url = window.location.href) {
  const query = {};
  url.replace(/([^?#*=&]+)=([^?#*=&]+)/g, (...arg) => {
    const [, keyName, value] = arg;
    query[keyName] = window.decodeURIComponent(value);
  });
  return name ? query[name] || '' : query;
}

/**
* @des 删除url上的指定query参数，返回处理后的url

 * #### 使用场景
 * 由于 vue-router 在 hash 模式下，通过 push 或者 replace 跳转路由并带查询参数时候或在一些特殊情况下，链接上参数会加到/#后面，类似 `https://xxx.com/#/page?id=1&pageId=677888`, 此时使用 window.location.search 或者是 rpf 的 getQuery 都获取不到 hash 问号后面的参数。
 * 所以开发这一个插件，可用删除链接上的参数
 * **示例**
 * @example
 * ```js
 * import { delUrlQuery } from './rpf/handlelUrlQuery';
 * // 假设页面为 https://new2.h5no1.com/?a=1&b=2&c=3
 * delUrlQuery(['a', 'c']); // https://new2.h5no1.com/?b=2
 * ```

 * @param { array } name 需要删除的参数名（可多个）
 * @param { string } url 路径地址
 * @return { url:string } 替换好的链接
 */
function delUrlQuery(names = [], url = window.location.href) {
  let baseUrl = '';
  let query = '';
  const tempArray = url.split('?');
  if (tempArray.length > 1) {
    baseUrl = `${tempArray.slice(0, tempArray.length - 1).join('?')}?`;
    query = tempArray[tempArray.length - 1];
  } else {
    baseUrl = `${tempArray[0]}?`;
    const [, val] = tempArray;
    query = val;
  }
  const omitQuery = omit(names, qs.parse(query));
  return `${baseUrl}${qs.stringify(omitQuery)}`;
}

/**
 * @des 替换url指定参数，如果指定参数不存在，则新增该参数
 *
 * #### 使用场景
 * 由于 vue-router 在 hash 模式下，通过 push 或者 replace 跳转路由并带查询参数时候或在一些特殊情况下，链接上参数会加到/#后面，类似 `https://xxx.com/#/page?id=1&pageId=677888`, 此时使用 window.location.search 或者是 rpf 的 getQuery 都获取不到 hash 问号后面的参数。
 * 所以开发这一个插件，可用修改链接上的参数
 *
 * **示例**
 * @example
 * ```js
 * import { changeUrlQuery } from './rpf/handlelUrlQuery';
 * // 假设页面为 https://new2.h5no1.com/?a=1&b=2
 * changeUrlQuery(window.location.href, 'a', 'updateA'); // https://new2.h5no1.com/?b=2&a=UpdateA
 * changeUrlQuery(window.location.href, 'c', '3'); // https://new2.h5no1.com/?a=1&b=2&c=3
 * ```
 *
 * @param { string } url 指定路径
 * @param { string } param 需要替换的参数key
 * @param { string } paramVal 替换后的新内容
 * @return { url:string } 替换好的链接
 */
function changeUrlQuery(url = window.location.href, param, paramVal) {
  let newAdditionalURL = '';
  let baseURL = '';
  let additionalURL = '';
  let tempArray = url.split('?');
  if (tempArray.length > 1) {
    baseURL = tempArray.slice(0, tempArray.length - 1).join('?');
    additionalURL = tempArray[tempArray.length - 1];
  } else {
    const [_baseURL] = tempArray;
    const [, _additionalURL] = tempArray;
    additionalURL = _additionalURL;
    baseURL = _baseURL;
  }
  let temp = '';
  if (additionalURL) {
    tempArray = additionalURL.split('&');
    for (let i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split('=')[0] !== param) {
        newAdditionalURL += temp + tempArray[i];
        temp = '&';
      }
    }
  }
  const rowsTxt = `${temp}${param}=${paramVal}`;
  return `${baseURL}?${newAdditionalURL}${rowsTxt}`;
}

export { getUrlQuery, delUrlQuery, changeUrlQuery };
