const qs = {
  stringify(query) {
    return Object.keys(query)
      .map(k => `${k}=${encodeURIComponent(query[k])}`)
      .join('&');
  }
};

/**
 * 小程序 webview 分享接口
 *
 * ```js
 * import webMinaShare from 'rpf/un/webMinaShare';
 *
 * // 从分享卡片打开将会打开 https://xxx.h5.h5no1.com/my-app/?a=1&b=2/#/home 的 webview
 * webMinaShare.setShare({
 *   title: '小程序分享标题',
 *   imageUrl: '小程序分享图片',
 *   pathname: '/my-app/',
 *   search: '?a=1&b=2',
 *   hash: '#/home'
 * });
 * ```
 */
const webMinaShare = {
  /**
   * 设置小程序右上角分享
   * @param {object} options
   * @param {string} options.title 分享标题
   * @param {string} options.imageUrl 分享缩略图
   * @param {string} options.pathname 分享的 webview 路径，不需要包含域名
   * @param {string} options.search 分享的 webview 查询参数
   * @param {string} options.hash 分享的 webview 哈希参数
   *
   */
  setShare({ title, imageUrl, pathname, search, hash }) {
    window.wx.miniProgram.postMessage({
      data: {
        type: 'onShareAppMessage',
        title,
        imageUrl,
        pathname,
        search,
        hash
      }
    });
  },

  /**
   * 打开小程序分享页面
   * @param {object} options
   * @param {string} options.title 分享标题
   * @param {string} options.imageUrl 分享缩略图
   * @param {string} options.pathname 分享的 webview 路径，不需要包含域名
   * @param {string} options.search 分享的 webview 查询参数
   * @param {string} options.hash 分享的 webview 哈希参数
   */
  openNativeShare({ title, imageUrl, pathname, search, hash }) {
    window.wx.miniProgram.navigateTo({
      url: `/pages/share/share?${qs.stringify({
        title,
        imageUrl,
        pathname,
        search,
        hash
      })}`
    });
  },

  /**
   * 打开小程序页面
   *
   * - 跳转其他小程序
   *   - nativePath: `'/pages/launch-weapp/index'`
   *   - options: `{ appId, path }`
   *
   * - 跳转联系客服页面
   *   - nativePath: `'/pages/contact/index'`
   *
   * @param {string} nativePath 小程序页面路径
   * @param {Record<string, any>} options 打开时携带的参数
   */
  openNative(nativePath, options) {
    window.wx.miniProgram.navigateTo({
      url: `${nativePath}?${qs.stringify(options)}`
    });
  }
};

export default webMinaShare;
