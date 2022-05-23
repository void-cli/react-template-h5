import { asString } from './verify-type';

/**
 * 判断 url 是否与当前域名存在跨域，多用在制作 canvas 海报图片的时候防止调用 `canvas.toDataURL` 失败，支持相对路径。
 *
 * @example
 * ```js
 * import isCrossOrigin from './rpf/un/isCrossOrigin';
 *
 * let src = '[...an image url...]';
 * let img = new Image();
 * // 这样写是为了兼容 iOS 10 以下的设备
 * if (isCrossOrigin(src)) {
 *   img.crossOrigin = 'Anonymous';
 * }
 * // img.crossOrigin = isCrossOrigin(src) ? 'Anonymous' : null 千万不要这样写！！！
 * img.onload = () => {
 *   console.log('ok');
 * };
 * img.src = src;
 * ```
 *
 * @param {string} url 需要判断的 URL
 * @returns 是否与当前域名存在跨域
 */
export default function isCrossOrigin(url) {
  asString(url || null, 'url is required and should be string');

  if (!/^data:/.test(url)) {
    const urlAnchor = document.createElement('a');
    urlAnchor.href = url;
    return urlAnchor.origin !== window.location.origin;
  }
  return false;
}
