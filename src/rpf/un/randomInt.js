import { asInt } from './verify-type/int';

/**
 * 返回 min 和 max 之间的随整数
 *
 * @example
 * ```js
 * import randomInt from '@/rpf/un/randomInt';
 * randomInt(0, 3); // [0, 1, 2, 3] 随机一个数字
 * ```
 *
 * @param {number} min 区间最小整数
 * @param {number} max 区间最大整数
 * @returns 区间内的随机整数
 */
export default function randomInt(min = 0, max = Number.MAX_VALUE) {
  asInt(min, 'min should be an integer');
  asInt(max, 'max should be an integer');

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
