import { Logger } from './Logger';
import { asFunction, isPromise } from './verify-type';

const logger = Logger.get('rpf/un/preventRepeat');

/**
 * 防止异步函数重复调用函数 - 异步函数开始执行时就会被加锁，直到执行完毕才会解锁
 *
 * - 控制台会打印信息，提示是否有接入
 *
 * 常用业务场景：请求按钮加锁 -- 抽奖按钮会发送请求给后端，这个时候需要给按钮加锁，在异步请求结束后，根据业务逻辑，更改按钮状态后并解锁按钮；
 *
 * @example
 * ```js
 * const preventRepeatFn = preventRepeat(async function (...args) {
 *   await new Promise((resolve, reject) => {
 *     let timer = setTimeout(() => {
 *       console.log(...args);
 *       resolve();
 *       clearTimeout(timer);
 *     }, 2000);
 *   });
 * });
 *
 * // 异步函数结束后才能再次调用函数，示例只会打1次：1,2,3
 * preventRepeatFn(1, 2, 3);
 * preventRepeatFn(1, 2, 3);
 * ```
 *
 * **关于第二个参数(options): 该参数仅在继承该方法的时候有用，不要用于其他业务场景！**
 *
 * @param {(...args: any[]) => Promise<any>} callbackFn 回调函数
 * @param {object} options 配置参数，仅在继承该方法的时候有用，不要用于其他业务场景！
 * @param {() => void} options.before 执行 callbackFn 之前的回调
 * @param {() => void} options.after 执行 callbackFn 之后的回调
 * @returns {(...args: any[]) => Promise<void>}
 */
export default function preventRepeat(callbackFn, options = {}) {
  asFunction(callbackFn, '请传入函数!');

  let lock = false;
  async function resultFn(...args) {
    if (!lock) {
      const usedMS = Date.now();
      logger.debug('防止异步函数重复调用程序启动');
      lock = true;
      options.before?.();

      const promise = callbackFn.call(this, ...args);
      if (isPromise(promise)) {
        await promise.catch(err => {
          logger.error(
            "The parameter 'callbackfn' throws an error and cannot recover the status. You need to fix this error"
          );
          return Promise.reject(err);
        });
      }

      lock = false;
      options.after?.();

      logger.debug('防止异步函数重复调用程序结束', `${Date.now() - usedMS}ms`);
    }
  }

  return resultFn;
}
