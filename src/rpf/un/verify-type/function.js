import { toAsserts } from './toAsserts';

/**
 * 校验函数类型
 *
 * @param {unknown} val
 * @returns { val is (...args: any[]) => any }
 */
export function isFunction(val) {
  return val instanceof Function;
}

/**
 * 断言函数类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is (...args: any[]) => any }
 */
export function asFunction(val, errMessage = 'is not a function') {
  return toAsserts(isFunction(val), errMessage);
}
