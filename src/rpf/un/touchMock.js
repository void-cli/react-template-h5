const elemMap = {};
let prevKey = null;
let prevType = null;
let id = 0;

const $wrap = document.createElement('div');
$wrap.style.zIndex = 999;
$wrap.setAttribute('data-touch-mock', 'true');
document.body.appendChild($wrap);

function createMockElem(key) {
  const $elem = document.createElement('div');
  $elem.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background-color: rgba(255, 0, 0, 0.5);
    border-radius: 50%;
    transform: translate3d(0, 0, 0);
    pointer-events: none;
    z-index: 999;
    visibility: hidden;
  `;
  $elem.setAttribute('data-key', key);
  // $elem.textContent = key;
  $wrap.appendChild($elem);
  return $elem;
}

let hideTimer = null;
function clearElem() {
  prevType = null;
  Object.keys(elemMap).forEach(k => {
    elemMap[k].$mockElems.forEach(el => {
      el.style.visibility = 'hidden';
    });
  });
}

/**
 * 模拟触摸事件的 touches，方便在桌面浏览器中测试多个触摸点，模拟的触摸点在对应事件触发时会绘制到页面中
 *
 * @example
 * ```js
 * import touchMock from './rpf/un/touchMock';
 * const $elem = document.getElementById('elem');
 * const onTouchMove = touchMock(
 *   (e, mockTouches) => {
 *     const touches = [...mockTouches, ...e.touches];
 *     // do anything with `touches`
 *   },
 *   [
 *     {
 *       clientX: 100,
 *       clientY: 100
 *     }
 *   ]
 * );
 *
 * $elem.addEventListener('touchmove', onTouchMove);
 * ```
 *
 * 在 React 函数组件中使用需要结合 `useMemo`
 *
 * ```js
 * import React, { useMemo } from 'react';
 * import touchMock from './rpf/un/touchMock';
 *
 * function App() {
 *   const onTouchMove = useMemo(() => {
 *     return touchMock(
 *       (e, mockTouches) => {
 *         const touches = [...mockTouches, ...e.touches];
 *         // do anything with `touches`
 *       },
 *       [
 *         { clientX: 100, clientY: 100 }
 *       ]
 *     );
 *   }, []);
 *   return <div onTouchMove={onTouchMove} />;
 * }
 * ```
 *
 * @param {(event: TouchEvent, mockTouches: Touch[]) => void} fn
 * @param {Touch[]} mockTouches
 * @returns {(event: TouchEvent) => void} 事件函数
 */
export default function touchMock(fn, mockTouches = []) {
  const key = `k${id}`;
  const $mockElems = mockTouches.map(() => createMockElem(key));
  elemMap[key] = {
    $mockElems,
    mockTouches
  };
  id += 1;

  return e => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(clearElem, 1000);
    if (prevType !== e.type + key) {
      if (prevKey) {
        elemMap[prevKey].$mockElems.forEach(el => {
          el.style.visibility = 'hidden';
        });
      }
      prevKey = key;
      elemMap[prevKey].$mockElems.forEach((el, i) => {
        const t = elemMap[prevKey].mockTouches[i];
        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${t.clientX - 10}px, ${
          t.clientY - 10
        }px, 0)`;
      });
      prevType = e.type + key;
    }
    fn(e, mockTouches);
  };
}
