/**
 * 类型判断函数转为断言函数
 *
 * @param {boolean} verifyResult 类型校验函数的返回值
 * @param {string} errMessage 报错信息
 */
export function toAsserts(verifyResult, errMessage) {
  if (!verifyResult) {
    throw new Error(errMessage);
  }
}
