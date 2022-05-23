import { asFunction, toAsserts } from './verify-type';
import { asInt, isInt } from './verify-type/int';

function wait(ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function isPosInt(x) {
  return isInt(x) && x > 0;
}

/**
 *
 * 循环调用 Promise，常用于接口轮询业务场景。
 *
 * @example
 * ```js
 * import promiseLoop from './rpf/un/promiseLoop';
 *
 * // 每 5 秒轮询一次 /some/api, 10 次后结束
 * const { stop } = promiseLoop(
 *   () => {
 *     return axios
 *       .get('/some/api')
 *       .then(res => {
 *         // update UI with response
 *       })
 *       .catch(err => {
 *         // handle error
 *       });
 *   },
 *   5000,
 *   10
 * );
 *
 * // 当需要停止的时候，调用 stop，一般需要在组件卸载时调用
 * stop();
 * ```
 *
 * @param {Function} func  一个返回 Promise 的函数
 * @param {number} interval 循环时间间隔，单位 ms，默认 0
 * @param {number} maxCall 未主动停止之前的最大循环次数，不填则持续循环
 * @returns {{ stop: Function }} { stop: 停止 Promise 循环 }
 *
 */
function promiseLoop(func, interval = 0, maxCall) {
  asFunction(func, 'func should be a function');
  asInt(interval, 'interval should be a positive integer');
  toAsserts(isPosInt(maxCall), 'maxCall should be a positive integer');

  let count = 0;
  let ing = true;
  function loop() {
    count += 1;
    if (maxCall && count >= maxCall) {
      ing = null;
    }
    return func()
      .then(() => wait(interval))
      .then(() => {
        if (ing) {
          return loop();
        }
        return null;
      });
  }
  loop();
  function stop() {
    ing = null;
  }
  return { stop };
}

export default promiseLoop;
