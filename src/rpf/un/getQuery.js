import qs from 'qs';

/**
 * 获取当前页面的查询参数的对象形式
 *
 * @example
 * ```js
 * import getQuery from '@/rpf/un/getQuery';
 * // 假设页面为 https://new2.h5no1.com/?a=1&b=2
 * const query = getQuery(); // { a: '1', b: '2' }
 * ```
 */
export default function getQuery() {
  return qs.parse(window.location.search.slice(1));
}
