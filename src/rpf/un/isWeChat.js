/**
 * 判断当前环境是否为微信
 *
 * @example
 * ```js
 * import isWeChat from '@/rpf/un/isWeChat';
 * isWeChat();
 * ```
 *
 * @returns 是否为微信
 */
export default function isWeChat() {
  return /MicroMessenger/i.test(navigator.userAgent);
}
