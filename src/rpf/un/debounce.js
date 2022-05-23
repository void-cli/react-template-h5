import { CONSOLE_METHODS, Logger } from './Logger';
import { asFunction } from './verify-type';

/**
 * 防抖函数
 *
 * - 多次调用只会执行最后一次调用
 * - 控制台会打印信息，提示是否有接入
 *
 * @example
 * ```js
 * const debounceFn = debounce(function (...args) {
 *   console.log(...args);
 * });
 *
 * // 500毫秒内多次调用只会打印最后一次调用的结果：1,2,3
 * debounceFn(1, 1, 1);
 * debounceFn(1, 2, 3);
 *
 * // 可以清除定时器，在某些场合可能会用得上，如 vue 的 beforeDestroy 生命周期中
 * debounceFn.clear();
 * ```
 *
 * @param {Function} fn 需要进行防抖操作的事件函数
 * @param {number} delay 防抖时间
 * @returns 返回防抖函数，可以调用 `.clear` 方法清除内部的定时器
 */
export default function debounce(fn, delay = 500) {
  asFunction(fn, '请传入函数!');

  let timer = null;

  function clear() {
    clearTimeout(timer);
  }

  function debounceFn(...args) {
    clear();

    timer = setTimeout(() => {
      Logger.log(CONSOLE_METHODS.DEBUG, 'rpf', '防抖程序启动');
      fn.call(this, ...args);
    }, delay);
  }
  debounceFn.clear = clear;

  return debounceFn;
}
