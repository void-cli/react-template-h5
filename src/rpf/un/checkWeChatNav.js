import { isIOS } from './isIOS';
import { isWeChat } from './isWeChat';
import { asFunction, asString, isNumber, toAsserts } from './verify-type';

const INIT_WIN_HEIGHT = window.innerHeight;
let timer = null;

/**
 * 判断在 iOS 微信中是否出现了底部导航栏，且导航栏遮挡了浏览器视口，且**未被遮挡区域的宽高比大于指定宽高比**的时候，为 body 元素添加指定的类名，并将 body 的高度设置为未被遮挡区域的高度，单位 px
 *
 * 在使用此模块时
 * - body 的子元素应该使用 `height: 100%` 的相对高度实现满屏布局，而不是 `height: 100vh`
 * - 由于内部依赖一个定时器实现，所以应该尽早调用此模块，可以在入口文件进行调用
 *
 * “未被遮挡区域的宽高比大于指定宽高比” 可以这样理解：在出现导航栏之后，未被遮挡区域的高度小于参数 maxRatio 中指定的高度（即除数），在实践中，maxRatio 绝大多数情况下可以指定为内容安全区域的比例，如 `750 / 1206`
 *
 * iPhone 主要机型微信浏览器尺寸参考 https://www.yuque.com/tzxmcy/wiki/qxx2sb#Qb5JE
 *
 * 导航栏表现：
 * - `window.innerHeight` 在导航栏出现前后有差值
 * - 不触发 window 的 `resize` 事件
 * - `@media (min/max-aspect-ratio)` 的媒体查询只能获取的导航栏出现前的比例
 *
 * --------
 *
 * Q: 如何在浏览器中模拟？
 *
 * A: 例如模拟 iPhone 7 触发效果
 *   - 将视口调整为 375 \* 603
 *   - console 运行以下代码
 *     ```js
 *     document.body.classList.add('has-wechat-nav');
 *     document.body.style.height = '554px';
 *     ```
 * ----------
 *
 * @example
 * ```js
 * import checkWeChatNav from '@/rpf/un/checkWeChatNav';
 *
 * checkWeChatNav({
 *   maxRatio: 750 / 1206, // 在 iPhone (5678(Plus)) 触发
 *   // maxRatio: 750 / 1330, // 在 iPhone (5678(Plus)|X*|11) 触发
 *   bodyClass: 'has-wechat-nav',
 *   onTrigger: () => {
 *     console.log('has wechat nav');
 *     document.querySelector('#myDiv').classList.add('my-responsive-class');
 *   }
 * });
 * ```
 *
 * @param {object} options
 * @param {number} options.maxRatio 触发屏幕最大比例，默认值为 `750 / 1206`
 * @param {string} options.bodyClass 触发时添加到 body 的类，默认值为 `has-wechat-nav`
 * @param {Function} options.onTrigger 触发时的回调函数
 */
export default function checkWeChatNav({
  maxRatio = 750 / 1206,
  bodyClass = 'has-wechat-nav',
  onTrigger = () => {}
} = {}) {
  if (!isNumber(maxRatio) || maxRatio === 0) {
    toAsserts(false, 'maxRatio is required and should be number');
  }
  asString(bodyClass, 'bodyClass is required and should be string');
  asFunction(onTrigger, 'onTrigger is required and should be function');

  function emitTrigger(nowWinHeight) {
    const nowWinWidth = window.innerWidth;

    const nowRatio = nowWinWidth / nowWinHeight;
    if (
      isWeChat() &&
      isIOS() &&
      nowWinHeight < INIT_WIN_HEIGHT &&
      nowRatio > maxRatio
    ) {
      if (!document.body.classList.contains(bodyClass)) {
        document.body.classList.add(bodyClass);
      }
      document.body.style.height = `${nowWinHeight}px`;
      onTrigger();
    }
  }

  clearInterval(timer);
  let cnt = 0;
  timer = setInterval(() => {
    const nowWinHeight = window.innerHeight;
    if (nowWinHeight < INIT_WIN_HEIGHT) {
      emitTrigger(nowWinHeight);
      clearInterval(timer);
    }
    cnt += 1;
    if (cnt >= 5) {
      clearInterval(timer);
    }
  }, 500);
}
