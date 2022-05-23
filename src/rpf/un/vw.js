import { asNumber } from './verify-type';

/**
 * 将 px 值转换为 vw 值，可传递转换基数和是否携带单位
 *
 * @example
 * ```js
 * vw(300); // `40vw`
 * vw(300, undefined, false); // `40`
 * vw(300, 1920); // `15.625vw`
 * ```
 *
 * @param {number} px 需要转换的 px 值
 * @param {number} base 转换基数，一般为设计稿宽度，默认 `750`
 * @param {number} unit 是否携带单位，默认 `true`
 * @returns 转换后的 vw 数值
 */
export default function vw(px, base = 750, unit = true) {
  asNumber(px, false, 'px is required and should be a number');
  asNumber(base, false, 'base is required and should be a number');

  return (Math.round(px) / base) * 100 + (unit ? 'vw' : '');
}
