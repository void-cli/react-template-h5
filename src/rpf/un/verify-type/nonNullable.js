import { toAsserts } from './toAsserts';

/**
 * 校验非 null 和 undefined 的值
 *
 * val为 null 或 undefined 的时候会返回false
 *
 * @param {unknown} val
 * @returns { val is NonNullable<typeof val> }
 */
export function isNonNullable(val) {
  return val !== undefined && val !== null;
}

/**
 * 断言非 null 和 undefined 的值
 *
 * val 为 null 和 undefined 的时候会抛出异常
 *
 * @param {unknown} val
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is NonNullable<typeof val> }
 */
export function asNonNullable(
  val,
  errMessage = "is can't a null or undefined"
) {
  return toAsserts(isNonNullable(val), errMessage);
}
