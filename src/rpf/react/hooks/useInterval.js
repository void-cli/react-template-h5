import { useEffect, useRef } from 'react';

/**
 * setInterval 的 hook 版本
 *
 * @example
 * ```js
 * import useInterval from './rpf/react/hooks/useInterval';
 *
 * const App = () => {
 *   const [int, setInt] = useState(true);
 *   useInterval(
 *     () => {
 *       if (someCondition) {
 *         setInt(false);
 *       }
 *     },
 *     int ? 1000 : null
 *   );
 *   return null;
 * };
 * ```
 *
 * @param {Function} callback setInterval 回调
 * @typedef {number | null} DelayType
 * @param {DelayType} delay 时间间隔，单位毫秒，值为 `null` 时停止 setInterval
 */
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    let id;
    if (delay !== null) {
      id = setInterval(tick, delay);
    }
    return () => {
      id && clearInterval(id);
    };
  }, [delay]);
}

export default useInterval;
