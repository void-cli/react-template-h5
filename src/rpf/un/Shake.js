import { asFunction, asNumber } from './verify-type';

const tips = {
  unauthorized:
    '未允许访问动作与方向权限，请通过:\n 设置 - Safari浏览器 - 高级 - 网站数据 - 移除所有网站数据',
  unknown: '非iOS 13+设备'
};

function iosGranted() {
  return new Promise((resolve, reject) => {
    const ua = navigator.userAgent.toLowerCase(); // 判断移动端设备，区分android，iphone，ipad和其它
    if (ua.indexOf('like mac os x') > 0) {
      const reg = /os [\d._]*/gi;
      const verinfo = ua.match(reg);
      const version = `${verinfo}`
        .replace(/[^0-9|_.]/gi, '')
        .replace(/_/gi, '.');
      if (parseFloat(version) >= 13) {
        if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
          window.DeviceMotionEvent.requestPermission()
            .then(permissionState => {
              if (permissionState === 'granted') {
                resolve(permissionState);
              } else if (permissionState === 'denied') {
                reject(tips.unauthorized);
              }
            })
            .catch(() => {
              reject(tips.unauthorized);
            });
        } else {
          // 处理常规的非iOS 13+设备
          reject(tips.unknown);
        }
      } else {
        resolve('success: ios13以下');
      }
    } else {
      resolve('success: 非ios设备');
    }
  });
}

/**
 * @typedef {() => void} OnStop
 * @typedef {(event: { options: ConstructorParameters<typeof Shake>[0]; deltaX: number; deltaY: number; deltaZ: number; }) => void} OnShake
 */

/**
 * 手机摇一摇功能
 *
 * - https 下才有效
 * - 针对 ios，ios13.3 以下可以直接摇，以上版本需要授权（需有点击交互）
 * - 假设没有允许授权，再次调起授权询问前需要手动清除授权数据
 *    1. 未允许访问动作与方向权限，请通过: 设置 - Safari浏览器 - 高级 - 网站数据 - 移除所有网站数据
 *    2. 金管家需要重启
 *
 * @example React
 * ```js
 * import Shake from '@/rpf/un/Shake';
 * // 实例化
 * let shake;
 * export default function ShakePage() {
 *   useEffect(() => {
 *     shake = new Shake({
 *       threshold: 1,
 *       timeout: 300,
 *       onShake: e => console.log('开摇', e),
 *       onStop: () => console.log('停止')
 *     });
 *     return () => {
 *       // 组件卸载，移除Shake
 *       shake.remove();
 *     };
 *   }, []);
 *   const handleStart = () => {
 *     // 开启
 *     shake.start().catch(err => {
 *       alert(err); // 可接受开启不了的错误
 *     });
 *   };
 *   const handleStop = () => {
 *     // 停止
 *     shake.stop();
 *   };
 *   return (
 *     <>
 *       <button onClick={handleStart}>开启</button>
 *       <button onClick={handleStop}>停止</button>
 *     </>
 *   );
 * }
 * ```
 * 
 * @example Vue
 * ```vue
 * <template>
 *   <div>
 *     <button @click="handleStart">开启</button>
 *     <button @click="handleStop">停止</button>
 *   </div>
 * </template>
 * 
 * <script>
 * import Shake from '@/rpf/un/Shake';
 * let shake;
 * export default {
 *   mounted(){
 *     // 实例化
 *     shake = new Shake({
 *       threshold: 1,
 *       timeout: 300,
 *       onShake: e => console.log('开摇', e),
 *       onStop: () => console.log('停止')
 *     });
 *   },
 *   methods: {
 *     handleStart(){
 *       // 开启
 *       shake.start().catch(err => {
 *         alert(err); // 可接受开启不了的错误
 *       });
 *     },
 *     handleStop() {
 *       // 停止
 *       shake.stop();
 *     }
 *   },
 *   beforeDestroy(){
 *     // 组件卸载，移除Shake
 *     shake.remove();
 *   }
 * };
 * </script>
 * ```

 */
export default class Shake {
  /**
   * @param {object} options
   * @param {number} options.threshold 抖动强度阈值，越小越容易触发摇，默认 15
   * @param {number} options.timeout 事件之间的默认间隔, 默认 1000ms
   * @param {OnShake} options.onShake 摇的事件，参数 e 获取详细数据
   * @param {OnStop} options.onStop 停止的事件
   */
  constructor({
    threshold = 15,
    timeout = 1000,
    onShake = null,
    onStop = null
  } = {}) {
    asNumber(threshold, false, 'threshold should be number');
    asNumber(timeout, false, 'timeout should be number');
    if (onShake !== null) {
      asFunction(onShake, 'onShake should be function');
    }
    if (onStop !== null) {
      asFunction(onStop, 'onStop should be function');
    }

    /**
     * @private
     * @ignore
     */
    this.options = {
      threshold,
      timeout,
      onShake,
      onStop
    };

    /**
     * @private
     * @ignore
     */
    this.lastTime = new Date();
    /**
     * @private
     * @ignore
     */
    this.lastX = null;
    /**
     * @private
     * @ignore
     */
    this.lastY = null;
    /**
     * @private
     * @ignore
     */
    this.lastZ = null;

    /**
     * @private
     * @ignore
     */
    this.canUse = false;
    this.init();
  }

  /**
   * @private
   * @ignore
   */
  init() {
    iosGranted()
      .then(() => {
        this.canUse = true;
      })
      .catch(err => console.log(err));
  }

  /**
   * @private
   * @ignore
   */
  devicemotion = e => {
    const current = e.accelerationIncludingGravity;
    let currentTime;
    let timeDifference;
    let deltaX = 0;
    let deltaY = 0;
    let deltaZ = 0;

    if (this.lastX === null && this.lastY === null && this.lastZ === null) {
      this.lastX = current.x;
      this.lastY = current.y;
      this.lastZ = current.z;
      return;
    }

    deltaX = Math.abs(this.lastX - current.x);
    deltaY = Math.abs(this.lastY - current.y);
    deltaZ = Math.abs(this.lastZ - current.z);

    if (
      (deltaX > this.options.threshold && deltaY > this.options.threshold) ||
      (deltaX > this.options.threshold && deltaZ > this.options.threshold) ||
      (deltaY > this.options.threshold && deltaZ > this.options.threshold)
    ) {
      // calculate time in milliseconds since last shake registered
      currentTime = new Date();
      timeDifference = currentTime.getTime() - this.lastTime.getTime();

      if (timeDifference > this.options.timeout) {
        this.options.onShake &&
          this.options.onShake({
            options: this.options,
            deltaX,
            deltaY,
            deltaZ
          });
        this.lastTime = new Date();
      }
    }

    this.lastX = current.x;
    this.lastY = current.y;
    this.lastZ = current.z;
  };

  /**
   * @private
   * @ignore
   */
  reset() {
    this.lastTime = new Date();
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
  }

  /**
   * 开始
   * @returns {Promise<void>}
   */
  start() {
    return new Promise((resolve, reject) => {
      if (!this.canUse) {
        iosGranted()
          .then(() => {
            this.canUse = true;
            this.remove();
            window.addEventListener('devicemotion', this.devicemotion, false);
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      } else {
        this.remove();
        window.addEventListener('devicemotion', this.devicemotion, false);
        resolve();
      }
    });
  }

  /**
   * 停止
   */
  stop() {
    if (!this.canUse) {
      return;
    }
    this.remove();
    this.options.onStop && this.options.onStop();
  }

  /**
   * 移除事件
   */
  remove() {
    if (!this.canUse) {
      return;
    }
    window.removeEventListener('devicemotion', this.devicemotion, false);
    this.reset();
  }
}
