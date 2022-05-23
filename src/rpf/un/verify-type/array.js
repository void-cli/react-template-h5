import { toAsserts } from './toAsserts';

/**
 * 校验 Array 类型
 *
 * @param {unknown} val
 * @returns { val is any[] }
 */
export function isArray(val) {
  return Array.isArray(val);
}

/**
 * 断言 Array 类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is any[] }
 */
export function asArray(val, errMessage = 'is not a array') {
  return toAsserts(isArray(val), errMessage);
}
