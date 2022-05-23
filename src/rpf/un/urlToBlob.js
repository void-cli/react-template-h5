import isCrossOrigin from './isCrossOrigin';
import { asString } from './verify-type';

/**
 * 将 url 指向的图片转换成一个 Blob 对象，用于上传图片到服务器，并提供了最大宽度压缩选项
 *
 * @example
 *
 * ```js
 * import urlToBlob from '@/rpf/un/urlToBlob';
 *
 * urlToBlob({
 *   url: 'https://example.com/1.jpg',
 *   maxWidth: 500
 * }).then(bin => {
 *   uploadToServer(bin);
 * });
 * ```
 *
 * @param {object} options
 * @param {string} options.url 图片的 URL
 * @param {number} options.maxWidth 图片压缩的最大宽度，单位为 px，不填则不压缩
 * @param {string} options.type 图片格式
 * @param {number} options.quality 清晰度
 * @param {'anonymous' | 'use-credentials'} options.crossOriginValue 请求图片时，将会尝试自动检查是否跨域，若是则为图片的 crossOrigin 属性设置该值，默认为 `anonymous`
 * @param {boolean} options.appendToDOM 是否将转换时创建的 canvas 元素插入到 DOM 树，一般仅在调试时用到
 * @returns {Promise<Blob>} 转换后的图片 Blob 对象
 */
function urlToBlob({
  url,
  maxWidth,
  type,
  quality,
  crossOriginValue = 'anonymous', // use-credentials
  appendToDOM
} = {}) {
  return new Promise((resolve, reject) => {
    asString(url || null, 'url is required and should be a string');

    const img = new Image();

    if (isCrossOrigin(url)) {
      img.crossOrigin = crossOriginValue;
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.width / img.height;
      let canvasWidth = img.width;

      if (maxWidth) {
        canvasWidth = Math.min(img.width, maxWidth);
      }

      canvas.width = canvasWidth;
      canvas.height = canvasWidth / ratio;
      if (appendToDOM) {
        canvas.style.display = 'none';
        canvas.id = `urlToBlob_${Date.now()}`;
        document.body.appendChild(canvas);
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (!canvas.toBlob) {
        reject(
          Error(
            'canvas.toBlob is not supported, try include this polyfill https://github.com/blueimp/JavaScript-Canvas-to-Blob'
          )
        );
      } else {
        try {
          canvas.toBlob(
            bin => {
              resolve(bin);
            },
            type,
            quality
          );
        } catch (err) {
          reject(err);
        }
      }
    };
    img.onerror = () => {
      reject(img);
    };
    img.src = url;
  });
}

export default urlToBlob;
