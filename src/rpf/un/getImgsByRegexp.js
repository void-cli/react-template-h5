import { asArray } from './verify-type';

/** @type {string[]} */
const IMAGES = require.context(`assets/img`, true, /\.(jpg|png|jpeg)$/);

/**
 * 获取 assets/img 目录下匹配正则数组中任意一个正则的所有图片的路径
 *
 * - 获取需要预加载的图片
 *
 * @example
 *
 * ```lua
 * src
 * └── assets
 *     └── img
 *       ├── home
 *       │   ├── a.png
 *       │   └── b.jpg
 *       └── other
 *           ├── c.png
 *           └── d.jpg
 * ```
 *
 * js:
 * ```js
 * import getImgsByRegexp from '@/rpf/un/getImgsByRegexp';
 *
 * const { imgs, otherImgs } = getImgsByRegexp([/\/home\//]);
 * console.log(imgs);
 * // ["/static/media/a.41b527ec.jpg", "/static/media/b.4b22c501png"]
 * console.log(otherImgs);
 * // ["/static/media/c.41b527ec.jpg", "/static/media/d.4b22c501png"]
 *
 * const { imgs: imgs2, otherImgs: otherImgs2 } = getImgsByRegexp([
 *   /\/home\//,
 *   /\/other\//
 * ]);
 * console.log(imgs2);
 * // ["/static/media/a.41b527ec.jpg", "/static/media/b.4b22c501png","/ * static/media/c.41b527ec.jpg", "/static/media/d.4b22c501png"]
 * console.log(otherImgs2);
 * // []
 * ```
 *
 * @param {RegExp[]} regexpArr 正则数组
 * @returns {{imgs: string[]; otherImgs: string[]}} imgs:匹配正则的图片，otherImgs:其他图片
 */
export default function getImgsByRegexp(regexpArr = []) {
  asArray(
    regexpArr,
    'getImgsByRegexp Error: regexpArr is required and should be array'
  );

  return IMAGES.keys().reduce(
    (acc, cur) => {
      const truePath = IMAGES(cur).default;
      if (/^data:/.test(truePath)) {
        return acc;
      }
      if (regexpArr.some(reg => reg.test?.(cur))) {
        acc.imgs.push(truePath);
      } else {
        acc.otherImgs.push(truePath);
      }
      return acc;
    },
    {
      imgs: [],
      otherImgs: []
    }
  );
}
