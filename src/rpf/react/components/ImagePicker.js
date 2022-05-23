/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
// polyfill
import 'blueimp-canvas-to-blob';
import loadImage from 'blueimp-load-image';
import PropTypes from 'prop-types';
import isWeChat from '../../un/isWeChat';
import wxGetLocalImgData from '../../un/wxGetLocalImgData';

const env = {
  wechat: isWeChat()
};

// https://www.npmjs.com/package/blueimp-load-image#options
const defaultOptions = {
  maxWidth: 750,
  orientation: true,
  canvas: true
};

const defaultWxOptions = {
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera']
};

function pick(names, obj) {
  const result = {};
  let idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
}

/**
 *
 * 支持压缩功能的图片选择器，渲染一个增强版的 `<input type="file" />` 元素。压缩功能使用 [blueimp-load-image](https://www.npmjs.com/package/blueimp-load-image) 模块实现。
 *
 * - 自动引入了 [blueimp-canvas-to-blob](https://www.npmjs.com/package/blueimp-canvas-to-blob) 作为 polyfill
 * - 需要自定义样式时，不要给 `<input />` 元素加上 `display: none`，此种方式在某些安卓设备会出现选择文件后不触发 `change` 事件的问题，应该使用 `opacity: 0`，再将元素定位到点击区域。
 *
 * **安装依赖**
 *
 * ```bash
 * npm i -S blueimp-load-image blueimp-canvas-to-blob
 * ```
 *
 * @example
 * ```js
 * import ImagePicker from './rpf/react/components/ImagePicker';
 *
 * const App = () => {
 *   return (
 *     <div>
 *       <ImagePicker
 *         onPick={canvas => {
 *           if (Array.isArray(canvas)) {
 *             canvas.forEach(item => {
 *               item.toDataURL();
 *             });
 *           } else {
 *             // 导出图片 base64
 *             canvas.toDataURL();
 *             // 导出二进制
 *             canvas.toBlob(bin => {
 *               uploadFile(bin);
 *             });
 *           }
 *         }}
 *       />
 *     </div>
 *   );
 * };
 * ```
 *
 * @param {object} props
 * @param {string} props.accept 传递给 `<input />` 的 accept 属性，默认值 `image/*`
 * @param {Record<string, any>} props.options 传递给 `loadImage` 的配置，基于默认值拓展，详见[blueimp-load-image 文档](https://www.npmjs.com/package/blueimp-load-image#options)，默认值：
 *   ```js
 *   {
 *     maxWidth: 750,
 *     orientation: true,
 *     canvas: true
 *   }
 *   ```
 * @param {Record<string, any>} props.wxOptions 传递给 `wx.chooseImage` 的配置，基于默认值拓展，默认值：
 *   ```js
 *   {
 *     count: 1,
 *     sizeType: ['original', 'compressed'],
 *     sourceType: ['album', 'camera']
 *   }
 *   ```
 * @param {Function} props.onValidate 文件校验函数，非必填，如果传入，只有返回真值才会调用 `onPick`
 *   - 参数在非微信环境为 File 对象
 *   - 参数在微信环境与 `wx.chooseImage` 的 `success` 回调一致
 * @param {Function} props.onPick
 *   - 参数在微信环境且`wxOptions.count > 1` 为压缩后的 canvas 数组
 *   - 其他情况为单个 canvas
 * @param {any[]} props.resetProps 其他常规的 DOM 属性，`style, className ...`
 *
 */
const ImagePicker = ({
  accept,
  options,
  wxOptions,
  onValidate,
  onPick,
  ...resetProps
}) => {
  function compressImage(fileOrUrl) {
    return loadImage(fileOrUrl, {
      ...defaultOptions,
      ...options
    });
  }

  async function localIdToCanvas(localId) {
    const { localData } = await wxGetLocalImgData({
      localId
    });
    const data = await compressImage(localData);
    return data.image;
  }

  async function onFileChange(e) {
    const file = e.target.files[0];
    if (!onValidate || onValidate(file)) {
      const data = await compressImage(file);
      onPick && onPick(data.image);
    }
  }
  async function onClickInput(e) {
    e.preventDefault();
    window.wx.chooseImage({
      ...pick(['count', 'sizeType', 'sourceType'], {
        ...defaultWxOptions,
        ...wxOptions
      }),
      async success(res) {
        const { localIds } = res;
        if (!onValidate || onValidate(res)) {
          if (localIds.length === 1) {
            const canvas = await localIdToCanvas(localIds[0]);
            onPick && onPick(canvas);
          } else {
            Promise.all(localIds.map(id => localIdToCanvas(id))).then(
              canvases => {
                onPick && onPick(canvases);
              }
            );
          }
        }
      }
    });
  }

  return (
    <input
      {...resetProps}
      type="file"
      accept={accept}
      onClick={env.wechat ? onClickInput : undefined}
      onChange={env.wechat ? undefined : onFileChange}
    />
  );
};

ImagePicker.defaultProps = {
  accept: 'image/*',
  wxOptions: {},
  options: {},
  onValidate: null,
  onPick: null
};

ImagePicker.propTypes = {
  accept: PropTypes.string,
  wxOptions: PropTypes.objectOf(PropTypes.object),
  options: PropTypes.objectOf(PropTypes.object),
  onValidate: PropTypes.objectOf(PropTypes.func),
  onPick: PropTypes.objectOf(PropTypes.func)
};

export default ImagePicker;
