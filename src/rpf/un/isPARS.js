/**
 * 判断当前环境是否为 PARS
 *
 * @example
 * ```js
 * import isPARS from '@/rpf/un/isPARS';
 * isPARS();
 * ```
 *
 * @returns 是否为金管家客户端
 */
export default function isPARS() {
  return /PARS/i.test(navigator.userAgent);
}
