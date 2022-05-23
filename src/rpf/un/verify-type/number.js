import { toAsserts } from './toAsserts';

/**
 * 校验 Number 类型
 *
 * @param {unknown} val
 * @param {boolean} supportNaN nan是否被视为数值
 * @returns { val is number }
 */
export function isNumber(val, supportNaN = false) {
  const isNum = typeof val === 'number';

  if (isNum && supportNaN && Number.isNaN(val)) {
    return false;
  }

  return isNum;
}

/**
 * 断言 Number 类型
 *
 * @param {unknown} val
 * @param {boolean} supportNaN nan是否被视为数值
 * @param {string} errMessage 报错的提示信息
 * @returns { asserts val is number }
 */
export function asNumber(
  val,
  supportNaN = false,
  errMessage = 'is not a number'
) {
  return toAsserts(isNumber(val, supportNaN), errMessage);
}
