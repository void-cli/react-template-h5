import { isString, toNumber } from './verify-type';

/**
 * 将 vw 值转换为 px 值
 *
 * @example
 * ```js
 * import vw from '@/rpf/un/vw';
 *
 * vwToPx(vw(100)); // 50 (假设 window.innerWidth = 375)
 * ```
 *
 * @param {string | number} value 需要转换的 vw 值
 * @returns 转换后的 px 数值
 */
export default function vwToPx(value) {
  const curValue = toNumber(isString(value) ? value.replace(/vw$/, '') : value);

  const oneVw = window.innerWidth / 100;
  return Math.round(oneVw * curValue);
}
