/**
 * 判断当前环境是否为 iOS
 *
 * @example
 * ```js
 * import isIOS from '@/rpf/un/isIOS';
 * isIOS();
 * ```
 *
 * @returns 是否为 iOS
 */
export default function isIOS() {
  return /(iPhone|iPad); /i.test(navigator.userAgent);
}
