/**
 * 创建全屏带测试字眼的水印添加到页面顶层
 *
 * - 内部判断当前链接带有 '-test' 或者 '-temp' 才会生效
 *
 * 解决问题：从页面展示上直观区分正式和测试环境
 *
 * **注意：添加水印后，会导致部分低版本安卓手机在微信环境不能滑动。暂未找到解决方法，但因为尽在测试环境才会生效，所以不影响正式，如有解决办法请补充。**
 *
 * @example
 * ```js
 *  createWatermark();
 * ```
 *
 * @param {string} text 展示文案
 */
export default function createWatermark(text = '测试环境,均为虚拟数据') {
  if (/(-test)|(-temp)/.test(window.location.href)) {
    const watermakr = document.createElement('div');
    watermakr.className = 'tz-watermark';

    const template = getTemplate(text);
    console.log(template);
    watermakr.style.cssText = `
      background-image: url(${template});
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999;
      pointer-events: none;
    `;

    document.body.appendChild(watermakr);
  }
}

function getTemplate(content) {
  const str = `
  <svg xmlns="http://www.w3.org/2000/svg" width="140px" height="150px">
    <text
      x="-50px"
      y="122px"
      style="fill: rgba(0,0,0,0.1);transform: rotate(-30deg);font-size: 12;"
    >${content}</text>
  </svg>`;

  // TODO: unescape 已被废弃，需要使用 decodeURI 代替
  const base64 = window.btoa(unescape(encodeURIComponent(str)));

  return `data:image/svg+xml;base64,${base64}`;
}
