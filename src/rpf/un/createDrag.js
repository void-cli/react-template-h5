import { asBoolean, asFunction, asNumber } from './verify-type';

/**
 * 创建可以拖动的元素，带有惯性配置
 *
 * @example
 *
 * ```js
 * import createDrag from '@/rpf/un/createDrag';
 * const pos = { x: 0, y: 0 };
 * const myElem = document.getElementById('my-elem');
 *
 * const { cancel } = createDrag(myElem, {
 *   onUpdate: ({ delta }) => {
 *     pos.x += delta.x;
 *     pos.y += delta.y;
 *     myElem.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0px)`;
 *   }
 * });
 *
 * // 需要进行清理的时候
 * cancel();
 * ```
 *
 * @param {HTMLElement} elem 事件绑定目标元素
 * @param {object} options 配置参数
 * @param {boolean} options.inertial 是否启动惯性，默认 true
 * @param {number} options.friction 摩擦力系数，0 - 1 之间，默认 `0.05`
 * @param {(event: TouchEvent) => void} options.onStart 拖动开始事件回调
 * @param {(event: { delta: {x: number; y: number} }) => void} options.onUpdate 拖动更新事件回调
 * @param {(event: TouchEvent) => void} options.onEnd 拖动结束事件回调
 * @param {() => void} options.onInertialEnd 拖动惯性结束事件回调
 * @returns
 */
export default function createDrag(
  elem,
  { inertial = true, friction = 0.05, onStart, onUpdate, onEnd, onInertialEnd }
) {
  asBoolean(inertial, 'inertial should be boolean');
  asNumber(friction, false, 'friction should be number');
  if (friction <= 0 || friction >= 1) {
    throw Error('friction should be in range of (0, 1)');
  }
  if (onStart) {
    asFunction(onStart, 'onStart should be function');
  }
  if (onUpdate) {
    asFunction(onUpdate, 'onUpdate should be function');
  }
  if (onEnd) {
    asFunction(onEnd, 'onEnd should be function');
  }
  if (onInertialEnd) {
    asFunction(onInertialEnd, 'onInertialEnd should be function');
  }

  let velocity = { x: 0, y: 0 };
  let dragging = false;
  let rafId = null;
  let prevTouch = {
    clientX: 0,
    clientY: 0
  };
  let inerEnded = true;
  let hasStart = false;

  function step() {
    rafId = requestAnimationFrame(step);
    if (!dragging) {
      if (Math.abs(velocity.x) >= 1 || Math.abs(velocity.y) >= 1) {
        const inerialDelta = {
          x: velocity.x,
          y: velocity.y
        };
        onUpdate &&
          onUpdate({
            delta: inerialDelta
          });
        velocity.x *= 1 - friction;
        velocity.y *= 1 - friction;
      } else if (!inerEnded) {
        onInertialEnd && onInertialEnd();
        inerEnded = true;
      }
    }
  }
  if (inertial) {
    step();
  }

  function normalizeTouch(e) {
    if (e.touches) {
      return e.touches[0];
    }
    return {
      clientX: e.clientX,
      clientY: e.clientY
    };
  }

  function onTouchStart(e) {
    hasStart = true;
    const touch = normalizeTouch(e);
    prevTouch = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    dragging = true;
    velocity = { x: 0, y: 0 };
    onStart && onStart(e);
    inerEnded = false;
  }

  function onTouchMove(e) {
    if (dragging) {
      e.preventDefault();
      const touch = normalizeTouch(e);
      const moveDelta = {
        x: touch.clientX - prevTouch.clientX,
        y: touch.clientY - prevTouch.clientY
      };
      velocity = moveDelta;
      onUpdate && onUpdate({ delta: moveDelta }, e);
      prevTouch = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
    }
  }

  function onTouchEnd(e) {
    if (!hasStart) {
      return;
    }
    hasStart = false;
    const touch = normalizeTouch(e);
    if (/^mouse/.test(e.type)) {
      dragging = false;
    } else if (touch) {
      prevTouch = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
    } else {
      dragging = false;
    }
    onEnd && onEnd(e);
  }

  function onCtxMenu(e) {
    e.preventDefault();
  }

  /** 移除拖动事件绑定 */
  function cancel() {
    elem.removeEventListener('mousedown', onTouchStart);
    window.removeEventListener('mousemove', onTouchMove);
    window.removeEventListener('mouseup', onTouchEnd);
    elem.removeEventListener('contextmenu', onCtxMenu);

    elem.removeEventListener('touchstart', onTouchStart);
    elem.removeEventListener('touchmove', onTouchMove);
    elem.removeEventListener('touchend', onTouchEnd);

    cancelAnimationFrame(rafId);
  }
  if (!('touchstart' in window)) {
    elem.addEventListener('mousedown', onTouchStart);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchEnd);
  } else {
    elem.addEventListener('touchstart', onTouchStart);
    elem.addEventListener('touchmove', onTouchMove);
    elem.addEventListener('touchend', onTouchEnd);
  }
  elem.addEventListener('contextmenu', onCtxMenu);

  return {
    cancel
  };
}
