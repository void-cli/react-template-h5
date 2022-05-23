// 检查图片是否跨域
import isCrossOrigin from './isCrossOrigin';
// 禁止页面滚动滚动
import preventScroll from './preventScroll';

preventScroll();

/**
 * canvas 图像编辑，实现图片根据选框移动、缩放、裁剪
 *
 * @example
 *
 * ```js
 * import CutImage from './rpf/un/CutImage';
 * const cutImage =  new CutImage({
 *   bgCanvas:document.getElementById('bgCanvas'),
 *   cutCanvas:document.getElementById('cutCanvas),
 *   img:require('./assets/images/2.jpg'),
 *   cutShape:[
 *       {x:w/2,y:0},
 *       {x:w,y:h},
 *       {x:0,y:h},
 *   ],//三个坐标点连起来是三角形
 * })
 * //调用toDataURL方法返回裁剪图片base64的数据
 * cutImage.toDataURL();
 * //调用destroy()方法销毁功能
 * cutImage.destroy();
 * ```
 *
 */
export default class CutImage {
  /**
   *
   * @typedef { 'arc' | 'prismatic' | 'rect' }  CutShapeType
   * @typedef { { x: number; y: number; } } CutShapeTypeItem
   *
   * @param {object} obj
   * @param {HTMLElement} obj.bgCanvas 承载图片的 canvas DOM 对象
   * @param {HTMLElement} obj.cutCanvas 承载选框的 canvas DOM 对象
   * @param {string} obj.img 需要编辑的图片
   * @param {CutShapeType | CutShapeTypeItem[]} obj.cutShape 裁剪框的样式，接收一个坐标数组[{x:0,y:0}]或是一个字符串[arc、prismatic、rect] = [圆、棱形、矩形]。默认是矩形
   *
   */
  constructor(obj) {
    /** @private @ignore */
    this.cutShape = 'rect';

    /** @private @ignore */
    // canvas对象
    this.bgCanvas = null;

    /** @private @ignore */
    this.cutCanvas = null;

    /** @private @ignore */
    // 存储两个画布
    this.bgCtx = null;

    /** @private @ignore */
    this.cutCtx = null;

    /** @private @ignore */
    // canvas对象的位置
    this.bgPos = null;
    /** @private @ignore */
    this.cutPos = null;

    /** @private @ignore */
    // canvas画布
    this.bgCanvas = null;
    /** @private @ignore */
    this.cutCanvas = null;
    /** @private @ignore */
    // 存储img与canvas的初始值
    this.startImg = {
      width: 0,
      height: 0,
      ratio: 1,
      ratioW: 1,
      ratioH: 1
    };
    /** @private @ignore */
    // 画图参数
    this.drawOption = {
      img: '',
      sx: 0,
      sy: 0,
      sWidth: 0,
      sHeight: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    /** @private @ignore */
    // 存储图像
    this.img = '';
    /** @private @ignore */
    // 比例
    this.nowScale = 1;
    /** @private @ignore */
    this.minScale = 1;
    /** @private @ignore */
    // 存储手指位置
    this.touchStartFinger = {};
    /** @private @ignore */
    // 绑定事件
    this.touchStart = this.touchStart.bind(this);
    /** @private @ignore */
    this.touchMove = this.touchMove.bind(this);
    /** @private @ignore */
    this.touchEnd = this.touchEnd.bind(this);

    // 检查参数
    this.check(obj);
    // 画布初始化
    this.init();
    // 初始化事件
    this.isEvent();
  }

  /**
   * @private
   * @ignore
   */
  init() {
    // 创建画布
    this.createCanvas();
    // 加载图像
    CutImage.loadImageFrom(this.img).then(img => {
      // 保存原始图片大小比例
      this.startImg = {
        width: img.width,
        height: img.height,
        ratio: img.width / img.height,
        ratioW: img.width / this.bgPos.width,
        ratioH: img.height / this.bgPos.height
      };
      let drawWidth;
      let drawHeight;

      // 让屏幕以最大的比例显示图像
      switch (true) {
        case img.width > this.bgPos.width:
          drawWidth = this.bgPos.width;
          drawHeight = img.height / this.startImg.ratioW;
          break;
        case img.height > this.bgPos.height:
          drawHeight = this.bgPos.height;
          drawWidth = img.width / this.startImg.ratioH;
          break;
        default:
          drawWidth = img.width;
          drawHeight = img.height;
      }
      // 计算最小缩放倍数
      const Minw = this.cutPos.width / drawWidth;
      const Minh = this.cutPos.height / drawHeight;
      const Min = Math.max(Minw, Minh);
      this.minScale = Min;
      if (this.minScale > this.nowScale) {
        this.nowScale = this.minScale;
      }

      // 居中
      const x = (this.bgPos.width - drawWidth * this.nowScale) / 2;
      const y = (this.bgPos.height - drawHeight * this.nowScale) / 2;

      this.drawOption = {
        img,
        sx: 0,
        sy: 0,
        swidth: img.width,
        sheight: img.height,
        x,
        y,
        width: drawWidth,
        height: drawHeight,
        startx: x,
        starty: y
      };
      this.drawImage();
    });
  }

  /**
   * 检查参数
   * @private
   * @ignore
   */
  check(obj) {
    if (
      !(
        obj.bgCanvas instanceof HTMLElement &&
        obj.cutCanvas instanceof HTMLElement
      )
    ) {
      throw new Error(`bgCanvas & cutCanvas 必须是一个DOM对象`);
    }
    if (!obj.img) {
      throw new Error(`请传入img`);
    }
    if (obj.cutShape) {
      this.cutShape = obj.cutShape;
    }
    this.bgCanvas = obj.bgCanvas;
    this.cutCanvas = obj.cutCanvas;
    this.img = obj.img;
  }

  /**
   * 创建canvas画布
   * @private
   * @ignore
   */
  createCanvas() {
    // 存储两个canvas的位置信息
    this.bgPos = this.bgCanvas.getBoundingClientRect();
    this.cutPos = this.cutCanvas.getBoundingClientRect();

    // 存储两个canvas画布
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.cutCtx = this.cutCanvas.getContext('2d');

    // 设置canvas的宽高，默认继承css样式
    this.bgCanvas.width = this.bgPos.width;
    this.bgCanvas.height = this.bgPos.height;
    this.cutCanvas.width = this.cutPos.width;
    this.cutCanvas.height = this.cutPos.height;

    // 裁剪canvas的形状
    this.Shape();
  }

  /**
   * 裁剪画布形状
   * @private
   * @ignore
   */
  Shape() {
    if (typeof this.cutShape === 'string') {
      switch (this.cutShape) {
        case 'arc':
          this.cutCtx.save();
          this.cutCtx.arc(
            this.cutPos.width / 2,
            this.cutPos.height / 2,
            Math.min(this.cutPos.width, this.cutPos.height) / 2,
            0,
            2 * Math.PI,
            false
          );
          this.cutCtx.restore();
          this.cutCtx.clip();
          break;
        case 'prismatic':
          this.cutCtx.save();
          this.cutCtx.beginPath();
          this.cutCtx.moveTo(this.cutPos.width / 2, 0);
          this.cutCtx.lineTo(0, this.cutPos.height / 2);
          this.cutCtx.lineTo(this.cutPos.width / 2, this.cutPos.height);
          this.cutCtx.lineTo(this.cutPos.width, this.cutPos.height / 2);
          this.cutCtx.closePath();
          this.cutCtx.restore();
          this.cutCtx.clip();
          break;
        default:
          break;
      }
    } else if (Array.isArray(this.cutShape)) {
      this.cutCtx.save();
      this.cutCtx.beginPath();
      this.cutShape.forEach((item, index) => {
        if (index === 0) {
          this.cutCtx.moveTo(item.x, item.y);
        } else {
          this.cutCtx.lineTo(item.x, item.y);
        }
      });
      this.cutCtx.closePath();
      this.cutCtx.restore();
      this.cutCtx.clip();
    }
  }

  /**
   * 加载图像
   * @param {string} src 图片url
   * @returns {Promise<HTMLImageElement>}
   */
  static loadImageFrom(src) {
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

  /**
   * 定义画画布的方法
   * @private
   * @ignore
   */
  drawImage() {
    const options = this.drawOption;
    this.bgCtx.clearRect(0, 0, this.bgPos.width, this.bgPos.height);
    this.bgCtx.drawImage(
      options.img,
      options.sx,
      options.sy,
      options.swidth,
      options.sheight,
      options.x,
      options.y,
      options.width * this.nowScale,
      options.height * this.nowScale
    );
    // 剪裁需要的比例
    let ratio = 1;
    // 存储canvas的差值
    const dif = {
      x: this.cutPos.left - this.bgPos.left,
      y: this.cutPos.top - this.bgPos.top
    };
    switch (true) {
      case options.img.width > this.bgPos.width:
        ratio = this.startImg.ratioW;
        break;
      case options.img.height > this.bgPos.height:
        ratio = this.startImg.ratioH;
        break;
      default:
        ratio = 1;
    }
    // 需要剪裁的位置this.startImg
    const cut = {
      sx: ((dif.x - options.x) * ratio) / this.nowScale,
      sy: ((dif.y - options.y) * ratio) / this.nowScale,
      sWidth: (this.cutPos.width * ratio) / this.nowScale,
      sHeight: (this.cutPos.height * ratio) / this.nowScale
    };
    this.cutCtx.clearRect(0, 0, this.cutPos.width, this.cutPos.height);
    this.cutCtx.drawImage(
      options.img,
      cut.sx,
      cut.sy,
      cut.sWidth,
      cut.sHeight,
      0,
      0,
      this.cutPos.width,
      this.cutPos.height
    );
  }

  /**
   * 画布移动边界值判断
   * @private
   * @ignore
   */
  region(x, y) {
    const maxX = Math.abs(this.bgPos.left - this.cutPos.left);
    const minX = -this.drawOption.width * this.nowScale + this.cutPos.right;
    const maxY = Math.abs(this.bgPos.top - this.cutPos.top);
    const minY = -this.drawOption.height * this.nowScale + this.cutPos.bottom;
    let nx = x;
    let ny = y;
    if (x < minX) {
      nx = minX;
    }
    if (y < minY) {
      ny = minY;
    }
    if (x > maxX) {
      nx = maxX;
    }
    if (y > maxY) {
      ny = maxY;
    }
    this.drawOption.x = nx;
    this.drawOption.y = ny;
  }

  /**
   * 初始化事件
   * @private
   * @ignore
   */
  isEvent() {
    this.destroy();
    document.addEventListener('touchstart', this.touchStart);
    document.addEventListener('touchmove', this.touchMove);
    document.addEventListener('touchend', this.touchEnd);
  }

  /**
   * @private
   * @ignore
   */
  touchStart(e) {
    const { touches } = e;
    if (touches.length === 1) {
      this.touchStartFinger = {
        pageX01: touches[0].pageX,
        pageY01: touches[0].pageY
      };
    } else if (touches.length === 2) {
      this.touchStartFinger = {
        pageX01: touches[0].pageX,
        pageY01: touches[0].pageY,
        pageX02: touches[1].pageX,
        pageY02: touches[1].pageY
      };
    }
  }

  /**
   * @private
   * @ignore
   */
  touchMove(e) {
    const { touches } = e;
    if (touches.length === 1) {
      const { pageX } = touches[0];
      const { pageY } = touches[0];
      const difX = this.touchStartFinger.pageX01 - pageX;
      const difY = this.touchStartFinger.pageY01 - pageY;
      this.region(this.drawOption.x - difX, this.drawOption.y - difY);
      this.drawImage();
      this.touchStartFinger = {
        pageX01: pageX,
        pageY01: pageY
      };
    } else if (touches.length === 2) {
      const pageX01 = e.touches[0].pageX;
      const pageY01 = e.touches[0].pageY;
      const pageX02 = e.touches[1].pageX;
      const pageY02 = e.touches[1].pageY;

      // 加判断防止pageX02为空
      this.touchStartFinger.pageX02 = this.touchStartFinger.pageX02
        ? this.touchStartFinger.pageX02
        : e.touches[1].pageX;
      this.touchStartFinger.pageY02 = this.touchStartFinger.pageY02
        ? this.touchStartFinger.pageY02
        : e.touches[1].pageY;
      const startTouches = this.touchStartFinger;
      // 计算缩放倍数（以端点之间的线段比例为依据）
      let angle = (pageX01 - pageX02) ** 2 + (pageY01 - pageY02) ** 2;
      let minAngle =
        (startTouches.pageX01 - startTouches.pageX02) ** 2 +
        (startTouches.pageY01 - startTouches.pageY02) ** 2;
      angle = Math.sqrt(angle);
      minAngle = Math.sqrt(minAngle);
      const scale = this.nowScale + (angle / minAngle - 1);
      this.nowScale = scale <= this.minScale ? this.minScale : scale;
      const x =
        this.drawOption.x -
        (this.drawOption.width * (angle / minAngle - 1)) / 2;
      const y =
        this.drawOption.y -
        (this.drawOption.height * (angle / minAngle - 1)) / 2;

      if (this.nowScale > this.minScale) {
        // 当到达最小倍数后，将不再更新坐标值
        this.region(x, y);
      }
      this.drawImage();
      this.touchStartFinger = {
        pageX01,
        pageY01,
        pageX02,
        pageY02
      };
    }
  }

  /**
   * @private
   * @ignore
   */
  touchEnd(e) {
    if (
      this.touchStartFinger.pageX01 === e.changedTouches[0].pageX &&
      this.touchStartFinger.pageX02
    ) {
      // 如果是第一个手指离开，且存在两个手指，则需要吧第二个手指赋值给第一个手指
      // 要不然下次移动的时候就会用第一个手指位置减去第二个手指位置，滑动距离较大
      this.touchStartFinger.pageX01 = this.touchStartFinger.pageX02;
      this.touchStartFinger.pageY01 = this.touchStartFinger.pageY02;
    }
    this.region(this.drawOption.x, this.drawOption.y);
    this.drawImage();
  }

  /**
   * 成功回调，返回裁剪画布base数据
   * @returns {string}
   */
  toDataURL() {
    // 成功按钮回调
    this.bgCtx.clearRect(0, 0, this.bgPos.width, this.bgPos.height);
    const base = this.cutCanvas.toDataURL('image/png');
    this.destroy();
    return base;
  }

  /**
   * 销毁
   */
  destroy() {
    // 销毁事件
    document.removeEventListener('touchstart', this.touchStart);
    document.removeEventListener('touchmove', this.touchMove);
    document.removeEventListener('touchend', this.touchEnd);
  }
}
