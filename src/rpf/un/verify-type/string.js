import { toAsserts } from './toAsserts';

/**
 * 校验 String 类型
 *
 * @param {unknown} val
 * @returns { val is string }
 */
export function isString(val) {
  return val && typeof val === 'string';
}

/**
 * 断言 String 类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is string }
 */
export function asString(val, errMessage = 'is not a string') {
  return toAsserts(isString(val), errMessage);
}
