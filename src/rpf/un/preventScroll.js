// polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = s => {
    let el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// detect supportsPassive
let supportsPassive = false;
function noop() {}
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
      return true;
    }
  });

  window.addEventListener('testPassive', noop, opts);
  window.removeEventListener('testPassive', noop, opts);
} catch (e) {
  supportsPassive = false;
}

// utils fn
function reachTop(elem) {
  return elem.scrollTop <= 0;
}

function reachBottom(elem) {
  return elem.scrollHeight - elem.scrollTop <= elem.clientHeight;
}

function intentToScrollVert(touch, prevTouch, canScrollHori) {
  if (!canScrollHori) {
    return true;
  }
  const deltaX = touch.clientX - prevTouch.clientX;
  const deltaY = touch.clientY - prevTouch.clientY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  return absX < absY;
}

function getCanScroll(elem, clientSizeKey, scrollSizeKey, overflowKey) {
  const clientSize = elem[clientSizeKey];
  const scrollSize = elem[scrollSizeKey];
  if (scrollSize <= clientSize) {
    return false;
  }
  return (
    ['hidden', 'visible'].indexOf(getComputedStyle(elem)[overflowKey]) === -1
  );
}

function getCanScrollHori(elem) {
  return getCanScroll(elem, 'clientWidth', 'scrollWidth', 'overflowX');
}

// function getCanScrollVert(elem) {
//   return getCanScroll(elem, 'clientHeight', 'scrollHeight', 'overflowY');
// }

/** 默认忽略的元素 */
const BASE_IGNORE_ELEM = ['#__vconsole', 'video'];

let prevTouch = null;
let $ignoreElem = null;
let isInBaseIgnoreElem = false;
let canScrollHori = false;
let ignoreArg = null;

function clearup() {
  prevTouch = null;
  $ignoreElem = null;
  isInBaseIgnoreElem = false;
  canScrollHori = false;
}

function injectCSS(selector) {
  const $style = document.createElement('style');
  $style.type = 'text/css';
  $style.setAttribute('data-prevent-scroll', 'true');
  $style.textContent = `${selector} { -webkit-overflow-scrolling: touch; }`;
  document.head.appendChild($style);
}

function removeCSS() {
  const $elem = document.querySelector('style[data-prevent-scroll]');
  $elem && $elem.parentElement.removeChild($elem);
}

function touchStartHandler(e) {
  if (typeof ignoreArg === 'string') {
    $ignoreElem = e.target.closest(ignoreArg);
    if ($ignoreElem) {
      canScrollHori = getCanScrollHori($ignoreElem);
    }
    const { clientX, clientY } = e.touches[0];
    prevTouch = { clientX, clientY };
  }
  isInBaseIgnoreElem = BASE_IGNORE_ELEM.some(elem => e.target.closest(elem));
}

function touchMoveHandler(e) {
  if (isInBaseIgnoreElem) {
    return;
  }
  if (typeof ignoreArg === 'string') {
    const touch = e.touches[0];
    let canScroll = true;
    if (!$ignoreElem) {
      canScroll = false;
    } else if (
      touch.clientY < prevTouch.clientY &&
      intentToScrollVert(touch, prevTouch, canScrollHori) &&
      reachBottom($ignoreElem)
    ) {
      canScroll = false;
    } else if (
      touch.clientY > prevTouch.clientY &&
      intentToScrollVert(touch, prevTouch, canScrollHori) &&
      reachTop($ignoreElem)
    ) {
      canScroll = false;
    }
    prevTouch = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    if (canScroll) {
      return;
    }
  }
  if (typeof ignoreArg === 'function' && ignoreArg(e.target)) {
    return;
  }
  if (e.cancelable) {
    e.preventDefault();
  }
}

function touchEndHandler() {
  $ignoreElem = null;
  isInBaseIgnoreElem = false;
}

// eslint-disable-next-line import/no-mutable-exports
export let hasCalled = false;

/**
 * 阻止页面弹性过渡滚动，在开发单屏页面的时候，你就很有可能需要此模块。一旦调用，页面上原本通过 CSS 设置滚动的元素将会失效，除非符合 ignore 参数的规则。
 *
 * _本模块对 VConsole 友好，不需要额外处理 VConsole 内部的滚动元素_
 *
 * @example
 * ```js
 * import preventScroll from '@/rpf/un/preventScroll';
 * preventScroll();
 * ```
 *
 * 启用后，原本有 `overflow: auto 或 scroll` 的元素将无法进行滚动， 需要在 html 页面中添加 `.scrollable` 类名:
 * ```html
 * <!-- 保留滚动行为需要加上 scrollable 类，不加则不保留 -->
 * <div class="scrollable"></div>
 * ```
 *
 * @param {object} options
 * @param {string | Function} options.ignore 默认值为 `.scrollable`，如果为字符串，则会被当作一个选择器字符串进行匹配，所有符合该选择器的元素将保留滚动行为（元素必须本来具有滚动行为，例如有固定的 `height` 和 `overflow: auto | scroll`）；如果为函数，则接收触发 touchmove 事件的 target 元素作为参数，如果函数返回 `true`，则保留本次 touchmove 默认行为。
 * @returns 恢复页面弹性过渡滚动
 */
export default function preventScroll({ ignore = '.scrollable' } = {}) {
  if (hasCalled) {
    return {
      cancel: () => {}
    };
  }

  ignoreArg = ignore;
  const options = supportsPassive ? { passive: false } : false;
  function cancel() {
    clearup();
    removeCSS();
    window.removeEventListener('touchstart', touchStartHandler, options);
    window.removeEventListener('touchmove', touchMoveHandler, options);
    window.removeEventListener('touchend', touchEndHandler, options);
    hasCalled = false;
  }
  cancel();
  hasCalled = true;

  injectCSS(ignore);

  window.addEventListener('touchstart', touchStartHandler, options);
  window.addEventListener('touchmove', touchMoveHandler, options);
  window.addEventListener('touchend', touchEndHandler, options);
  return { cancel };
}
