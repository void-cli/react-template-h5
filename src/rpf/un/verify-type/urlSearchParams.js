import { toAsserts } from './toAsserts';

/**
 * 校验 URLSearchParams 类型
 * @param {unknown} val
 * @returns { val is URLSearchParams }
 */
export function isURLSearchParams(val) {
  return val instanceof URLSearchParams;
}

/**
 * 断言 URLSearchParams 类型
 * @param {unknown} val
 * @returns { asserts val is URLSearchParams }
 */
export function asURLSearchParams(
  val,
  errMessage = 'is not a URLSearchParams'
) {
  return toAsserts(isURLSearchParams(val), errMessage);
}
