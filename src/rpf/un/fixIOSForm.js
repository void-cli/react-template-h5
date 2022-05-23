import isIOS from './isIOS';

const env = {
  iOS: isIOS()
};
let focusing = false;
let timer = null;
let scrollPos = { x: 0, y: 0 };

/**
 * 修复 iOS webview 在触发软键盘弹出的表单元素失去焦点之后页面整体往上偏移的问题。
 *
 * 在安卓上，触发软键盘弹出的表单元素聚焦后，视口高度会变小，如果布局依赖了视口高度，可能会出现错乱，目前还没有通用模块解决方案，常见的做法是，进入页面后，把最外层的容器的高度设置为当前视口高度，防止键盘弹出后高度被挤压。
 *
 * @example
 * ```js
 * import fixIOSForm from './rpf/un/fixIOSForm';
 * fixIOSForm();
 * ```
 *
 * @example React
 * ```js
 * const App = () => {
 *   const [appHeight, setAppHeight] = useState('100%');
 *   useEffect(() => {
 *     setAppHeight(window.innerHeight);
 *   }, []);
 *   return (
 *     <div
 *       className="app"
 *       style={{
 *         height: appHeight
 *       }}
 *     ></div>
 *   );
 * };
 * ```
 *
 * @example Vue
 * ```vue
 * <template>
 *   <div class="app" :style="{ height: appHeight }"></app>
 * </template>
 * <script>
 * export default {
 *   data: () => ({
 *     appHeight: '100%'
 *   }),
 *   mounted() {
 *     this.appHeight = window.innerHeight + 'px';
 *   }
 * }
 * </script>
 * ```
 *
 * @returns {() => void} 销毁此功能
 */
export default function fixIOSForm() {
  function destroy() {
    clearTimeout(timer);
    document.removeEventListener('focusin', focusIn, false);
    document.removeEventListener('focusout', focusOut, false);
  }
  destroy();
  document.addEventListener('focusin', focusIn, false);
  document.addEventListener('focusout', focusOut, false);
  return {
    destroy
  };
}

function getScrollPos() {
  return {
    x: Math.max(
      window.pageXOffset,
      document.documentElement.scrollLeft,
      document.body.scrollLeft
    ),
    y: Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
  };
}

function isUnstableElem(elem) {
  if (elem) {
    const tagName = elem.tagName.toLowerCase();
    const type = elem.getAttribute && elem.getAttribute('type');
    return (
      ['select', 'textarea'].indexOf(tagName) !== -1 ||
      (!type && tagName === 'input') ||
      (tagName === 'input' &&
        [
          'color',
          'date',
          'datetime-local',
          'email',
          'month',
          'number',
          'password',
          'search',
          'tel',
          'text',
          'time',
          'url',
          'week'
        ].indexOf(type) !== -1)
    );
  }
  return false;
}

function focusIn(e) {
  if (env.iOS && isUnstableElem(e.target)) {
    focusing = true;
    scrollPos = getScrollPos();
  }
}

function focusOut(e) {
  focusing = false;
  if (env.iOS) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (
        (!focusing && !isUnstableElem(document.activeElement)) ||
        e.target === document.activeElement
      ) {
        window.scrollTo(scrollPos.x, scrollPos.y);
      }
    }, 50);
  }
}
