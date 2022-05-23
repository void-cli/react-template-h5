/*
 * @Author: Sexy
 * @Date: 2019-08-23 18:18:41
 * @LastEditors: musi
 * @LastEditTime: 2021-09-07 18:21:41
 * @Description: file content
 */

import { isFunction } from './verify-type';

/**
 * @typedef { () => void } Noop
 * @typedef {'visible' | 'hidden' | 'prerender'} VisibilityState
 * @typedef {(visibleChange: VisibilityState) => void} OptionsFunction
 * @typedef {{ onChange?: OptionsFunction; onHide?: Noop; onShow?: Noop; }} Options
 */

/**
 * 添加一个网页前后台状态变化的事件
 * - 最低兼容至 Android 4.4 和 iOS 8
 * - 金管家内部可以使用 PALifeOpen.setOnFocus 替代 https://tzxmcy.yuque.com/tzxmcy/wiki/gc9h7r#9HG3R；
 *
 * 使用场景：
 * - 跳外链做任务，返回时检查任务是否完成的业务逻辑；
 * - 页面退到后台，暂停视频或者音乐，页面重回前台，重新播放；
 *
 * 参数：
 * Options：
 * - onShow：页面显示回调
 * - onHide：页面隐藏回调
 * - onChange：页面变化回调，参数为 visibilityState 属性，可参考 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilityState Document.visibilityState} 属性
 *
 * OptionsFunction：
 * - 与 onChange 一致
 *
 *
 * @example
 * ```js
 * import addVisibilityChangeHandler from '@/rpf/un/addVisibilityChangeHandler'
 *
 * const off = addVisibilityChangeHandler((visibilityState) => {
 *   console.log(VisibilityState)
 * })
 * off();
 * ```
 *
 * @example
 * ```js
 * const off = addVisibilityChangeHandler({
 *    onChange: (visibilityState) => {
 *      console.log(VisibilityState)
 *    },
 *    onShow: () => {
 *      // show
 *    },
 *    onHide: () => {
 *      // hide
 *    }
 * })
 * off();
 * ```
 *
 * @param {OptionsFunction | Options} options 回调方法/回调方法对象
 * @return {() => void} 移除事件
 */
export default function addVisibilityChangeHandler(options) {
  if (!options) return undefined;
  let onChange;
  let onHide;
  let onShow;
  if (isFunction(options)) onChange = options;
  else {
    ({ onChange, onHide, onShow } = options);
  }

  // 对document.hidden做前缀处理
  const prefixes = ['webkit', 'moz', 'ms', 'o'];
  const VISIBLE = 'visible';
  const HIDDEN = 'hidden';
  function getHiddenProp() {
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (let i = 0; i < prefixes.length; i++) {
      if (`${prefixes[i]}Hidden` in document) return `${prefixes[i]}Hidden`;
    }

    // otherwise it's not supported
    return null;
  }

  // 获取document.visibilityState属性
  function getVisibilityState() {
    if ('visibilityState' in document) return 'visibilityState';
    for (let i = 0; i < prefixes.length; i++) {
      if (`${prefixes[i]}VisibilityState` in document)
        return `${prefixes[i]}VisibilityState`;
    }
    // otherwise it's not supported
    return null;
  }
  let handler = null;
  // 给document添加事件
  const visProp = getHiddenProp();
  let evtname = '';
  if (visProp) {
    evtname = `${visProp.replace(/[H|h]idden/, '')}visibilitychange`;
    handler = () => {
      const visibilityState = document[getVisibilityState()];
      if (visibilityState === VISIBLE) {
        getFun(onShow)();
      } else if (visibilityState === HIDDEN) {
        getFun(onHide)();
      }
      getFun(onChange)(visibilityState);
    };
    document.addEventListener(evtname, handler, false);
  }
  return () => {
    handler && document.removeEventListener(evtname, handler);
  };
}

function getFun(fn) {
  if (isFunction(fn)) return fn;
  return () => {};
}
