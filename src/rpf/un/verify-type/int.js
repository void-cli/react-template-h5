import { isNumber } from './number';
import { toAsserts } from './toAsserts';

/**
 * 校验数值整数
 *
 * @param {unknown} val
 * @returns { val is number }
 */
export function isInt(val) {
  return isNumber(val) && Number.isFinite(val) && Math.floor(val) === val;
}

/**
 * 断言数值整数
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is number }
 */
export function asInt(val, errMessage = 'is not a integer') {
  return toAsserts(isInt(val), errMessage);
}
