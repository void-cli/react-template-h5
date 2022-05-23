import { asFunction, asNumber } from './verify-type';

/**
 * 设置一个帧率定时器
 *
 * @example
 *
 * ```js
 * const { cancel } = setFPS(() => {
 *   console.log('每秒输出 24 次');
 * }, 24);
 *
 * // 需要停下的时候
 * calcel();
 *```
 *
 * @param {() => void} cb 帧率定时器回调函数
 * @param {number} fps 帧率，默认 `60`
 * @returns 清除帧率定时器
 */
function setFPS(cb, fps = 60) {
  asFunction(cb, 'cb should be function');
  asNumber(fps, true, 'fps should be number');

  if (fps < 1 || fps > 60) {
    throw Error('fps should be in range of [1, 60]');
  }

  const interval = parseInt(1000 / Math.min(fps, 60), 10);

  let id = null;
  let prevTime = performance.now();
  function loop(ts) {
    id = requestAnimationFrame(loop);
    if (ts - prevTime >= interval) {
      cb();
      prevTime = ts;
    }
  }
  id = requestAnimationFrame(loop);
  return {
    /** 清除帧率定时器 */
    cancel: () => {
      cancelAnimationFrame(id);
    }
  };
}

export default setFPS;
