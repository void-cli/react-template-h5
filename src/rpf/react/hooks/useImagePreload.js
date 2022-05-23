import { useEffect, useRef, useState } from 'react';
import { isArray, toAsserts } from '../../un/verify-type';

const notDataURL = src => !/^data:/.test(src);

/**
 * 图片预加载 hook，自动过滤 base64 URL
 *
 * @example
 * ```js
 * import useImagePreload from './rpf/react/hooks/useImagePreload';
 *
 * const importAll = r =>
 *   r.keys().map(path => {
 *     const source = r(path);
 *     return typeof source === 'object' ? source.default : source;
 *   });
 * // 生成 ./assets/imgs/ 下所有图片的路径数组，根据需要调整
 * const preloadImgs = importAll(
 *   require.context('./assets/imgs/', true, /\.(jpg|png|gif)$/)
 * );
 *
 * const App = () => {
 *   const { loaded, total } = useImagePreload({
 *     imgs: preloadImgs,
 *     onFinish: () => {
 *       console.log('finish');
 *     },
 *     onError: () => {
 *       console.log('error');
 *     }
 *   });
 *   return <div>{Math.round((loaded / total) * 100)}</div>;
 * };
 * ```
 * @param {object} param
 * @param {string[]} param.imgs 预加载图片 URL 数组, 必填
 * @param {Function} param.onFinish 预加载完成回调函数
 * @param {Function} param.onError 预加载出错回调函数
 * @returns {{ loaded: string, total: string }} { loaded: 已加载图片数量 , total: 需要加载图片总数 }
 *
 */
function useImagePreload({ imgs = [], onFinish, onError } = {}) {
  toAsserts(
    isArray(imgs) && imgs.length > 0,
    'imgs is required and should be array'
  );

  const imgsRef = useRef();
  useEffect(() => {
    if (!imgsRef.current) {
      imgsRef.current = imgs.filter(notDataURL);
    }
  }, [imgs]);

  const onFinishRef = useRef();
  const onErrorRef = useRef();

  useEffect(() => {
    onFinishRef.current = onFinish;
    onErrorRef.current = onError;
  });

  const [loaded, setLoaded] = useState(
    () => imgs.length - imgs.filter(notDataURL).length
  );
  useEffect(() => {
    imgsRef.current.forEach(src => {
      const img = new Image();
      img.onload = () => {
        setLoaded(preLoaded => preLoaded + 1);
      };
      img.onerror = () => {
        onErrorRef.current &&
          onErrorRef.current(new Error(`load error: ${src}`));
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (loaded === imgs.length) {
      setTimeout(() => {
        onFinishRef.current && onFinishRef.current();
      }, 0);
    }
  }, [loaded, imgs]);

  return {
    loaded,
    total: imgs.length
  };
}

export default useImagePreload;
