/**
 * 获取安卓版本
 *
 * @example
 * ```js
 * import getAndroidVersion from '@/rpf/un/getAndroidVersion';
 * getAndroidVersion();
 * ```
 *
 * @returns 版本字符串
 */
export default function getAndroidVersion() {
  const match = navigator.userAgent.match(/Android ([\d.]+);/);
  return match ? match[1] : null;
}
