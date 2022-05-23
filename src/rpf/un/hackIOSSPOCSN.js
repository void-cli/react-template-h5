import getIOSVersion from './getIOSVersion';

const BASE_HACK_LIST = ['12', '13'];

function createHiddenElement() {
  const div = document.createElement('div');
  div.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
  `;
  document.body.append(div);
  return div;
}

function hack() {
  const $div = createHiddenElement();

  const count = 0;
  function redraw() {
    const str = count ? count - 1 : count + 1;
    $div.innerHTML = str;
    window.requestAnimationFrame(redraw);
  }

  window.addEventListener('pageshow', redraw, { capture: false, once: true });
}

/**
 * 处理在 iOS 13 设备下 Webkit 内核浏览器中，页面跳转到外部链接，然后通过浏览器后退键返回后，requestAnimationFrame, setTimeout 不执行的问题。
 *
 * 原因为 iOS 13 与 Webkit 内核浏览器默认开启的试验性功能 Swap Processes on Cross-Site Navigation 冲突。（ 暂未发现 iOS 13 之前版本出现该问题 ）
 *
 * @example
 * ```js
 * import hackIOSSPOCSN from '@/rpf/un/hackIOSSPOCSN';
 * hackIOSSPOCSN();
 * ```
 *
 */
export default function hackIOSSPOCSN() {
  const IOS_VERSION = getIOSVersion();
  if (!IOS_VERSION) return;
  if (BASE_HACK_LIST.includes(IOS_VERSION.split('.')[0])) hack();
}
