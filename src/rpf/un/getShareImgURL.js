import { asString } from './verify-type';

/**
 * 获取分享图标的 URL，需要先将图标放在脚手架的 public 目录。
 *
 * 解决的问题：
 * - 可以保证在本地开发环境，线上测试环境，线上生产环境都能得到正确的分享图标 URL。
 * - 使用 `require` 或者 `import` 的方式引用分享图标在文件过小的情况下会得到一个 base64 URL 不适用于微信分享
 *
 * 线上生产环境构建请参考 https://www.yuque.com/tzxmcy/wiki/auyhmu#10426907
 *
 * @example
 * ```js
 * import getShareImgURL from '@/rpf/un/getShareImgURL';
 *
 * getShareImgURL('share.jpg');
 * // 本地开发环境 => http://localhost:8080/share.jpg
 * // 线上测试环境 => https://域名/my-project/share.jpg
 * // 线上生产环境 => https://cdn域名/my-project/share.jpg
 * ```
 *
 * @param {string} filename 图标文件名，默认 `share.png`
 * @returns 分享图标 URL
 */
export default function getShareImgURL(filename = 'share.png') {
  let baseURL;
  if (typeof process.env.PUBLIC_URL !== 'undefined') {
    baseURL = process.env.PUBLIC_URL;
  } else if (typeof process.env.BASE_URL !== 'undefined') {
    baseURL = process.env.BASE_URL;
  }

  asString(
    baseURL,
    '请先设置环境变量 process.env.PUBLIC_URL 或者 process.env.BASE_URL'
  );

  asString(filename, 'filename is required and should be string');

  if (/^[./]/.test(filename)) {
    throw new Error('filename can not start with . or /');
  }
  if (!/\.(png|jpe?g)$/i.test(filename)) {
    throw new Error('filename should end with .png, .jpg, .jpeg');
  }

  const { origin, pathname } = window.location;

  const fallbackBaseURL = origin + pathname;
  return (
    ensureEndSlash(/^http/.test(baseURL) ? baseURL : fallbackBaseURL) + filename
  );
}

function ensureEndSlash(path) {
  return /\/$/.test(path) ? path : `${path}/`;
}
