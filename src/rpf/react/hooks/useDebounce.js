import { useEffect, useMemo, useRef } from 'react';
import debounce from '../../un/debounce';

/**
 * 防抖函数，基于 rpf/un/debounce 封装的 hook
 *
 * @example
 * ```js
 * const debounceFn = useDebounce(async (...args) => {
 *   console.log(...args);
 * }, 500);
 *
 * // 500毫秒内多次调用只会打印最后一次调用的结果：1,2,3
 * debounceFn(1, 1, 1);
 * debounceFn(1, 2, 3);
 * ```
 *
 * @param {Function} fn 需要进行防抖操作的事件函数
 * @param {number} delay 防抖时间
 * @returns { (...args: any[]) => void }
 */
const useDebounce = (fn, delay) => {
  const fnRef = useRef(fn);

  const debounceFn = useMemo(() => debounce(fnRef.current, delay), [delay]);

  useEffect(
    () => () => {
      debounceFn.clear();
    },
    [debounceFn]
  );

  return debounceFn;
};

export default useDebounce;
