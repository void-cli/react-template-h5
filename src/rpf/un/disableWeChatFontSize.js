/**
 * 禁用微信浏览器调整字体功能
 *
 * @example
 * ```js
 * import disableWeChatFontSize from '@/rpf/un/disableWeChatFontSize';
 * disableWeChatFontSize();
 * ```
 */
export default function disableWeChatFontSize() {
  // iOS
  const $style = document.createElement('style');

  // TODO: HTMLStyleElement.type 属性已废弃
  $style.type = 'text/css';

  $style.setAttribute('data-wechat-font-size', 'true');
  $style.innerText = `body {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }`;
  document.head.appendChild($style);

  function handleFontSize() {
    window.WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
    window.WeixinJSBridge.on('menu:setfont', () => {
      window.WeixinJSBridge.invoke('setFontSizeCallback', { fontSize: 0 });
    });
  }

  // android
  if (window.WeixinJSBridge && window.WeixinJSBridge.invoke) {
    handleFontSize();
  } else {
    document.addEventListener('WeixinJSBridgeReady', handleFontSize, false);
  }
}
