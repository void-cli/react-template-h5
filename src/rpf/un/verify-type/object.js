import { isArray } from './array';
import { toAsserts } from './toAsserts';

/**
 * 校验 Object 类型
 *
 * @param {unknown} val
 * @returns { val is Record<string, any> }
 */
export function isObject(val) {
  return !isArray(val) && typeof val === 'object';
}

/**
 * 断言 Object 类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is Record<string, any> }
 */
export function asObject(val, errMessage = 'is not a object') {
  return toAsserts(isObject(val), errMessage);
}
