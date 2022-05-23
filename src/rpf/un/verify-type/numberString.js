import { isString } from './string';
import { toAsserts } from './toAsserts';

/**
 * 校验数字字符串
 *
 * @param {unknown} val
 * @returns { val is string }
 */
export function isNumberString(val) {
  return isString(val) && !Number.isNaN(Number(val));
}

/**
 * 断言数字字符串
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is string }
 */
export function asNumberString(
  val,
  errMessage = "can't be parsed by Number()"
) {
  return toAsserts(isNumberString(val), errMessage);
}

/**
 * 转换数字字符串为数值类型
 * @param {string | number} val
 */
export function toNumber(val) {
  if (isString(val)) {
    asNumberString(val);
  }
  return Number(val);
}
