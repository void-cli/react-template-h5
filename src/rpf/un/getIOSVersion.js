/**
 * 获取 iOS 版本
 *
 * @example
 *
 * ```js
 * import getIOSVersion from '@/rpf/un/getIOSVersion';
 * getIOSVersion();
 * ```
 * @returns 版本字符串
 */
export default function getIOSVersion() {
  const match = navigator.userAgent.match(/iPhone OS ([\d_]+)/);
  return match ? match[1].replace(/_/g, '.') : null;
}
