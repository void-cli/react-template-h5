/**
 * 禁用页面缓存，用于解决 ios 后退页面不重新执行页面逻辑
 * @example
 *
 * ```js
 * import disablePageCache from '@/rpf/un/disablePageCache';
 * disablePageCache();
 * ```
 */
export default function disablePageCache() {
  function onPageShow(e) {
    if (/(iPhone|iPad); /i.test(navigator.userAgent) && e.persisted) {
      window.location.reload();
    }
  }
  window.addEventListener('pageshow', onPageShow);
  return {
    /**
     * 取消禁用页面缓存，大部分情况不需要
     */
    cancel() {
      window.removeEventListener('pageshow', onPageShow);
    }
  };
}
