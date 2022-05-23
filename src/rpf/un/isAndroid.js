/**
 * 判断当前环境是否为安卓
 *
 * @example
 * ```js
 * import isAndroid from '@/rpf/un/isAndroid';
 * isAndroid();
 * ```
 *
 * @returns 是否为安卓
 */
export default function isAndroid() {
  return /Android /i.test(navigator.userAgent);
}
