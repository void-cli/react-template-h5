import qs from 'qs';

import { asArray, asObject, asString } from './verify-type';

/**
 * 过滤 URL 的 query 参数，支持变更 hash
 *
 * @example
 *
 * ```js
 * import filterQuery from '@/rpf/un/filterQuery';
 * // 假设当前页面为 https://new2.h5no1.com/page/?a=1&b=2&code=qq#/home
 * const shareLink = filterQuery(
 *   location.href,
 *   ['code'],
 *   { shareId: 'abc' },
 *   '#/share'
 * );
 * // => https://new2.h5no1.com/page/?a=1&b=2&shareId=abc#/share
 * ```
 *
 * @param {string} url 需要过滤的 URL，必填
 * @param {string[]} omit 需要去除的query参数键
 * @param {Record<string, string | number>} merge 需要合并的query参数键值对
 * @param {string} nextHash 需要变更的 hash，要加"#"
 * @returns 过滤参数后的 URL
 */
export default function filterQuery(url, omit = [], merge = {}, nextHash) {
  asString(url, 'url is required and should be string');
  asArray(omit, 'omitQuery should be array');
  asObject(merge, 'mergeQuery should be object');
  if (nextHash) {
    asString(nextHash, 'nextHash should be string');
  }

  const el = document.createElement('a');
  el.href = url;

  const oldQuery = qs.parse(el.search.slice(1));

  const query = qs.stringify(
    {
      ...omitParams(omit, oldQuery),
      ...merge
    },
    { addQueryPrefix: true }
  );

  const { origin, pathname, hash } = el;
  return `${origin}${pathname}${query}${defaultTo(hash, nextHash)}`;
}

function omitParams(names, obj) {
  const result = {};
  const index = {};
  let idx = 0;
  const len = names.length;

  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }

  // TODO: 不符合eslint
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
}

function defaultTo(d, v) {
  // TODO: 不符合eslint
  // eslint-disable-next-line no-self-compare
  return v == null || v !== v ? d : v;
}
