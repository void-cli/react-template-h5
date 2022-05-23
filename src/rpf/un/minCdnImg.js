import filterQuery from './filterQuery';
import { Logger } from './Logger';

const logger = Logger.get('rpf/un/minCdnImg');

/**
 * 生成一个 cdn 图片压缩后的 URL
 * 
 * @example
 * 
 * ```js
 * import minCdnImg from 'rpf/un/minCdnImg';
 * 
 * const imgSrc =
 *   'https://cdn2.h5no1.com/server/front-config/20201231/8mwtkVHBQOYM'; // 481KB
 * minCdnImg(imgSrc); // https://cdn2.h5no1.com/server/front-config/20201231/8mwtkVHBQOYM?x-oss-process=image%2Fquality%2Cq_75 51.8 KB
 * ```

 * @param {string} src cdn 图片链接
 * @param {number} width 调整宽度，默认不调整
 * @param {number} quality 压缩质量，0 - 100，默认 75
 * @returns 压缩后的 cdn 图片地址
 */
export default function minCdnImg(src, width = 0, quality = 75) {
  if (!/cdn2\.h5no1\.com/.test(src)) {
    logger.warn(`${src} 不是来自 cdn 的图片`);
  }
  return filterQuery(src, [], {
    'x-oss-process': [
      'image',
      width ? `resize,w_${width}` : undefined,
      `quality,q_${quality}`
    ]
      .filter(i => i)
      .join('/')
  });
}
