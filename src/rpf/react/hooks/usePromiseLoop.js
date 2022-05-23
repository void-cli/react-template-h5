import { useEffect, useRef } from 'react';
import promiseLoop from '../../un/promiseLoop';

// null or undefined
function isNil(x) {
  return x == null;
}

/**
 *
 * 循环调用 Promise，常用于接口轮询业务场景。组件卸载时将自动停止，也可以手动停止
 *
 * @example
 * ```js
 * import React, { useState } from 'react';
 * import usePromiseLoop from './rpf/react/hooks/usePromiseLoop';
 *
 * const App = () => {
 *   const [loopInt, setLoopInt] = useState(5000);
 *   // 每 5 秒轮询一次 /some/api, 10 次后结束
 *   usePromiseLoop(
 *     () => {
 *       return axios
 *         .get('/some/api')
 *         .then(res => {
 *           // update UI with response
 *         })
 *         .catch(err => {
 *           // handle error
 *         });
 *     },
 *     loopInt,
 *     10
 *   );
 *   return (
 *     <button type="button" onClick={() => setLoopInt(null)}>
 *       stop promise loop
 *     </button>
 *   );
 * };
 * ```
 *
 * @param {Function} func 一个返回 Promise 的函数
 * @typedef {number | null | undefined} IntervalType
 * @param {IntervalType} interval 循环时间间隔，单位 ms，默认 0，值为 `null` 或 `undefined` 时停止循环
 * @param {number} maxCall 未主动停止之前的最大循环次数，不填则持续循环
 */
function usePromiseLoop(func, interval = 0, maxCall) {
  const funcRef = useRef();
  useEffect(() => {
    funcRef.current = func;
  });
  useEffect(() => {
    function loopFn() {
      return funcRef.current();
    }
    let loop;
    if (!isNil(interval)) {
      loop = promiseLoop(loopFn, interval, maxCall);
    }
    return () => {
      loop?.stop();
    };
  }, [interval, maxCall]);
}

export default usePromiseLoop;
