import { useEffect, useRef } from 'react';

/**
 *
 * 获取上一次渲染时的值
 *
 * @example
 * ```js
 * import usePrevious from './rpf/react/hooks/usePrevious';
 *
 * const App = (props) => {
 *   const prevOpen = usePrevious(props.open);
 *   return (
 *     <div>上一次：{prevOpen}</div>
 *     <div>本次：{props.open}</div>
 *   );
 * };
 * ```
 *
 * @param {T} value 需要获取值的引用
 * @returns {T} prevValue 上一次渲染时的值
 *
 */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default usePrevious;
