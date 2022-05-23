import { Logger, CONSOLE_METHODS } from './Logger';
import { asFunction } from './verify-type';

/**
 * 节流函数
 *
 * - 多次调用只会执行第一次调用
 * - 控制台会打印信息，提示是否有接入
 *
 * @example
 * ```js
 * const throttleFn = throttle(function (...args) {
 *   console.log(...args);
 * });
 *
 * // 500毫秒内多次调用只会打印第一次调用的结果： 1,2,3
 * throttleFn(1, 1, 1);
 * throttleFn(1, 2, 3);
 * ```
 *
 * @param {Function} fn 需要进行节流操作的事件函数
 * @param {number} gapTime 节流时间时间
 * @returns { (...args: any[]) => void }
 */
export default function throttle(fn, gapTime = 500) {
  asFunction(fn);

  let enterTime = 0;
  return function throttleFn(...args) {
    const backTime = new Date();
    if (backTime - enterTime > gapTime) {
      Logger.log(CONSOLE_METHODS.DEBUG, 'rpf', '节流程序启动');
      fn.call(this, ...args);
      enterTime = backTime;
    }
  };
}
