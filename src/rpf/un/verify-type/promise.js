import { isFunction } from './function';
import { toAsserts } from './toAsserts';

/**
 * 校验 Promise 类型
 *
 * @param {unknown} val
 * @returns { val is Promise<any> }
 */
export function isPromise(val) {
  return val instanceof Promise || isFunction(val && val.then);
}

/**
 * 断言 Promise 类型
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is Promise<any> }
 */
export function asPromise(val, errMessage = 'is not a promise') {
  return toAsserts(isPromise(val), errMessage);
}
