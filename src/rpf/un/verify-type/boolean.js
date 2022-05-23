import { toAsserts } from './toAsserts';

/**
 * 校验 boolean 类型
 *
 * @param {unknown} val
 * @returns { val is boolean }
 */
export function isBoolean(val) {
  return typeof val === 'boolean';
}

/**
 * 断言 boolean 类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is boolean }
 */
export function asBoolean(val, errMessage = 'is not a function') {
  return toAsserts(isBoolean(val), errMessage);
}
