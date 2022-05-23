import vwToPx from './vwToPx';
import vw from './vw';

/**
 * {@link vw un/vw} 与 {@link vwToPx un/vwToPx} 的组合
 *
 * 主要用于解决 {@link https://www.yuque.com/tzxmcy/wiki/qxx2sb#gstLI 安卓最非整数像素的渲染问题}
 *
 *
 * ```js
 * xpv(100); // 50 (假设 window.innerWidth = 375)
 * ```
 *
 * @param {number} value 需要转换的设计稿 px 值，750 宽度基准
 * @returns 转换后的 px 数值，也就是在设备上渲染后的像素值
 */
export default function vpx(value) {
  return vwToPx(vw(value, undefined, false));
}
