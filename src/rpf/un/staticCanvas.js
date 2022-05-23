/* eslint-disable radix */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import isCrossOrigin from './isCrossOrigin';
import { asArray, asNumber } from './verify-type';

// tools
function loadImageFrom(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 判断是否跨域
    if (isCrossOrigin(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(Error(`fail to load image from ${src}`));
    };
    img.src = src;
  });
}

function escapeXhtml(string) {
  return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
}

// 图片
async function paint(ctx, attrs) {
  const dd = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    src: '',
    ...attrs
  };
  const img = await loadImageFrom(dd.src);
  ctx.save();
  ctx.drawImage(
    img,
    dd.x,
    dd.y,
    dd.width || img.width,
    dd.height || img.height
  );
  ctx.restore();
}

function setCtx(ctx, props) {
  const propsMap = {
    fill: 'fillStyle',
    stroke: 'strokeStyle',
    strokeWidth: 'lineWidth',
    opacity: 'globalAlpha'
  };
  Object.keys(props).forEach(k => {
    if (propsMap[k]) {
      ctx[propsMap[k]] = props[k];
    } else {
      ctx[k] = props[k];
    }
  });
  return ctx;
}

// 文字
function text(ctx, attrs) {
  const ctxProps = {
    font: '16px Arial',
    text: '[text]',
    fill: '#000',
    stroke: '#000',
    strokeWidth: 0,
    textBaseline: 'top',
    textAlign: 'start',
    maxWidth: 0,
    lineHeight: 0,
    x: 0,
    y: 0,
    ...attrs
  };
  resetX();
  ctx.save();
  const { x, y, text, maxWidth, lineHeight, textOverflow, ...restProps } =
    ctxProps;
  setCtx(ctx, restProps);
  getTextList().forEach((text, index) => {
    fillText(text, y + lineHeight * index);
  });
  ctx.restore();

  function resetX() {
    if (!ctxProps.maxWidth) return;
    if (ctxProps.textAlign === 'center') ctxProps.x += ctxProps.maxWidth / 2;
    if (ctxProps.textAlign === 'end') ctxProps.x += ctxProps.maxWidth;
  }
  function getTextList() {
    const texts = text.split('\n');
    const textList = [];
    texts.map(text => {
      if (!isOverflow(text)) return textList.push(text);
      if (typeof textOverflow === 'string') {
        return textList.push(handleOverflowText(text));
      }
      return textList.push(...splitOverflowText(text));
    });
    return textList;
  }
  function handleOverflowText(texts) {
    let res = '';
    for (let i = 0; i < texts.length; i++) {
      if (isOverflow(res + texts[i] + textOverflow)) return res + textOverflow;
      res += texts[i];
    }
  }
  function splitOverflowText(text) {
    const res = [];
    const last = Array.from(text).reduce((acc, curr) => {
      if (!isOverflow(acc + curr)) return acc + curr;
      res.push(acc);
      return curr;
    });
    return [...res, last];
  }
  function isOverflow(text) {
    return maxWidth && ctx.measureText(text).width > maxWidth;
  }
  function fillText(text, y) {
    if (restProps.stroke && restProps.strokeWidth) {
      ctx.strokeText(text, x, y);
    }
    ctx.fillText(text, x, y);
  }
}

// 矩形
function rect(ctx, attrs) {
  const ctxProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 1,
    opacity: 1,
    ...attrs
  };
  ctx.save();
  ctx.beginPath();
  const { x, y, width, height, ...restProps } = ctxProps;
  setCtx(ctx, restProps);
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 圆
function circle(ctx, attrs) {
  const ctxProps = {
    x: 0,
    y: 0,
    radius: 0,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 1,
    opacity: 1,
    ...attrs
  };
  ctx.save();
  ctx.beginPath();
  const { x, y, radius, ...restProps } = ctxProps;
  setCtx(ctx, restProps);
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// 圆角图片
async function mask(ctx, attrs) {
  const dd = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    src: '',
    borderRadius: 0,
    ...attrs
  };
  const img = await loadImageFrom(dd.src);
  if (!dd.width) {
    dd.width = img.width;
  }
  if (!dd.height) {
    dd.height = img.height;
  }
  // 直径最大取高度一半
  let arcRadius = dd.borderRadius;
  if (arcRadius > dd.height) {
    arcRadius = parseInt(dd.height) / 2;
  }

  ctx.save();
  ctx.beginPath();
  // 从左上角相切的顶边切点开始，画一直线至右上角相切的顶边切点，然后绘制一条270°顺时针至0°的短圆弧
  ctx.moveTo(dd.x + arcRadius, dd.y);
  ctx.lineTo(dd.x + dd.width - arcRadius, dd.y);
  ctx.arc(
    dd.x + dd.width - arcRadius,
    dd.y + arcRadius,
    arcRadius,
    (Math.PI / 180) * 270,
    0,
    false
  );
  ctx.lineTo(dd.x + dd.width, dd.y + dd.height - arcRadius);
  // 0°顺时针至90°的短圆弧
  ctx.arc(
    dd.x + dd.width - arcRadius,
    dd.y + dd.height - arcRadius,
    arcRadius,
    0,
    (Math.PI / 180) * 90,
    0,
    false
  );
  ctx.lineTo(dd.x + arcRadius, dd.y + dd.height);
  // 90°顺时针至180°的短圆弧
  ctx.arc(
    dd.x + arcRadius,
    dd.y + dd.height - arcRadius,
    arcRadius,
    (Math.PI / 180) * 90,
    (Math.PI / 180) * 180,
    false
  );
  ctx.lineTo(dd.x, dd.y + arcRadius);
  // 180°顺时针至270°的短圆弧
  ctx.arc(
    dd.x + arcRadius,
    dd.y + arcRadius,
    arcRadius,
    (Math.PI / 180) * 180,
    (Math.PI / 180) * 270,
    false
  );
  ctx.clip();

  ctx.drawImage(img, dd.x, dd.y, dd.width, dd.height);
  ctx.restore();
}

// 以svg形式渲染html元素
function html(ctx, { x = 0, y = 0, ...attrs } = {}) {
  const { html, css } = attrs;
  const PRELOED_COUT_ID = '__PRELOED_COUT_ID';
  let preLoadCout = document.getElementById(PRELOED_COUT_ID);
  if (!preLoadCout) {
    preLoadCout = document.createElement('div');
    preLoadCout.id = PRELOED_COUT_ID;
    preLoadCout.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      width: 100%;
      pointer-events: none;
    `;
    document.body.appendChild(preLoadCout);
  }
  const node = document.createElement('div');
  node.innerHTML = html;
  for (const [key, value] of Object.entries(css)) {
    node.style[key] = value;
  }
  node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  preLoadCout.appendChild(node);
  const { width, height } = node.getBoundingClientRect();
  preLoadCout.removeChild(node);
  const xhtml = escapeXhtml(new XMLSerializer().serializeToString(node));
  const foreignDomStr = `<foreignObject x="0" y="0" width="100%" height="100%">${xhtml}</foreignObject>`;
  const svgDomStr = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${foreignDomStr}</svg>`;
  return paint(ctx, {
    src: svgDomStr,
    width,
    height,
    x,
    y
  });
}

/**
 * 根据指定的尺寸和图层生成一个 canvas，图层支持的类型有图片（支持圆角），文字，矩形，圆形。
 *
 * - 图片的 src 支持字符串或者返回字符串 Promise 的函数，并自动进行图片跨域检查。
 * - 文字支持匹配转义字符 \n 换行、设置最大宽度后自动换行、居中和省略号取代溢出部分。
 * - html 类型主要解决绘制文本在不用设备位置差异，以及复杂样式的文本渲染
 *
 * @example
 *
 * ```js
 * import staticCanvas from '@/rpf/un/staticCanvas';
 *
 * staticCanvas({
 *   width: 750,
 *   height: 1200,
 *   layers: [
 *     {
 *       type: 'image',
 *       src: '[image_url]',
 *       // 或者 src: () => qrcode.toDataURL('qrcode text'),
 *       x: 0,
 *       y: 0,
 *       width: 100,
 *       height: 100,
 *       borderRadius: 50
 *     },
 *     {
 *       type: 'text',
 *       font: '16px Arial',
 *       text: 'text value',
 *       // 匹配转义字符 \n 换行
 *       // text: 'text \n value'
 *       fill: 'blue',
 *       stroke: 'red',
 *       strokeWidth: 5,
 *       textAlign: 'left',
 *       x: 0,
 *       y: 0,
 *       maxWidth: 400, // 最大宽度，下面 textAlign textOverflow 自动换行 基于此属性
 *       lineHeight: 64, // 行高根据字体大小设置
 *       textAlign: 'center', // 默认 start，可选 center end
 *       textOverflow: '...' // 设置文字替代溢出文字 (设置了该属性就没有自动换行)
 *     },
 *     {
 *       type: 'rect',
 *       x: 0,
 *       y: 0,
 *       width: 100,
 *       height: 100,
 *       fill: 'blue',
 *       stroke: 'red',
 *       strokeWidth: 10,
 *       opacity: 0.5
 *     },
 *     {
 *       type: 'circle',
 *       x: 0,
 *       y: 0,
 *       radius: 50,
 *       fill: 'blue',
 *       stroke: 'red',
 *       strokeWidth: 10,
 *       opacity: 0.5
 *     },
 *     {
 *       type: 'html',
 *       x: 0,
 *       y: 0,
 *       html: '<strong>Hello</strong><br />World!', // 父元素为div
 *       css: {
 *         // 父元素的css样式
 *         fontSize: '60px',
 *         color: '#fff'
 *       }
 *     }
 *   ]
 * })
 *   .then(canvas => {
 *     const posterImgSrc = canvas.toDataURL();
 *   })
 *   .catch(err => {
 *     console.log('staticCanvas error', err);
 *   });
 * ```
 *
 * @param {object} options
 * @param {number} options.width canvas 宽度
 * @param {number} options.height canvas 高度
 * @param {any[]} options.layers 图层数组，详细参数请参考示例
 * @returns
 */
export default async function staticCanvas({
  width,
  height,
  layers = []
} = {}) {
  asNumber(width, false, 'width is required and should be a number');
  asNumber(height, false, 'height is required and should be a number');
  asArray(layers, 'layers is required and should be an array');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio; // 假设dpr为2
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  for (const layerItem of layers) {
    const { type, ...attrs } = layerItem;
    if (type === 'image') {
      let newSrc = null;
      if (typeof layerItem.src === 'function') {
        newSrc = await layerItem.src();
      } else {
        newSrc = layerItem.src;
      }
      attrs.src = newSrc;
      // 画图
      if (attrs.borderRadius) {
        await mask(ctx, attrs);
      } else {
        await paint(ctx, attrs);
      }
    } else if (type === 'text') {
      await text(ctx, attrs);
    } else if (type === 'rect') {
      await rect(ctx, attrs);
    } else if (type === 'circle') {
      await circle(ctx, attrs);
    } else if (type === 'html') {
      await html(ctx, attrs);
    }
  }
  return canvas;
}
