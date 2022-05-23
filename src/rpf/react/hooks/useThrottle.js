import { useMemo, useRef } from 'react';
import throttle from '../../un/throttle';

/**
 * 节流函数，基于 rpf/un/throttle 封装的 hook
 *
 * @example
 * ```js
 * const throttleFn = useThrottle(function (...args) {
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
const useThrottle = (fn, gapTime) => {
  const fnRef = useRef(fn);

  return useMemo(() => throttle(fnRef.current, gapTime), [gapTime]);
};

export default useThrottle;
