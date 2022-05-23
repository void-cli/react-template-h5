import { useMemo, useRef, useState } from 'react';
import preventRepeat from '../../un/preventRepeat';

/**
 * 基于 rpf/un/preventRepeat 封装的 hooks；返回的函数可以作为 hook 的依赖；
 *
 * 注意：如果传入的函数报错，会导致一直锁住，所以请对函数做好错误处理；
 *
 * @example
 * ```js
 * const App = () => {
 * const [handleClick, lock] = usePreventRepeat(async () => {
 *   try {
 *     await new Promise(resolve => {
 *       setTimeout(() => {
 *         resolve();
 *       }, 1000);
 *     });
 *   } catch (error) {
 *     // 错误处理
 *   }
 * });
 *   return (
 *     <div>
 *       <button type="button" onClick={handleClick}>
 *         {lock ? 'lock' : 'open'}
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @param {(...args: any[]) => Promise<any>} fn 需要处理的函数
 * @returns {[(...args: any[]) => Promise<void>, boolean]} [ 处理后的函数，是否锁着 ]
 */
function usePreventRepeat(fn) {
  const [lock, setLock] = useState(false);

  const fnRef = useRef(fn);

  const preventRepeatFn = useMemo(
    () =>
      preventRepeat(fnRef.current, {
        before() {
          setLock(true);
        },
        after() {
          setLock(false);
        }
      }),
    []
  );

  return [preventRepeatFn, lock];
}

export default usePreventRepeat;
