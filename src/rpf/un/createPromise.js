/**
 * 一种模式代码，通常用于将分散的异步回调转成 `Promise`（可以代替同时监听几个变量的 vue watch）
 *
 * @example
 * 代码改造前
 * ```vue
 * <template>
 *   <Loading @finish="_onLoadingFinish" />
 *   <Animation @end="_onAnimationEnd" />
 * </template>
 * <script>
 * export default {
 *   data: () => ({
 *     loadingDone: true,
 *     animationDone: true,
 *     loginDone: true
 *   }),
 *   watch: {
 *     // 每增加一个事件，就要增加一个 watch，还要增加一个 if 条件
 *     loadingDone(val) {
 *       if (val && this.animationDone && this.loginDone) {
 *         this._allDone();
 *       }
 *     },
 *     animationDone(val) {
 *       if (val && this.loadingDone && this.loginDone) {
 *         this._allDone();
 *       }
 *     },
 *     loginDone(val) {
 *       if (val && this.loadingDone && this.animationDone) {
 *         this._allDone();
 *       }
 *     }
 *   },
 *   mounted() {
 *     api.postLogin().then(res => {
 *       this.loginDone = true;
 *     });
 *   },
 *   methods: {
 *     _onLoadingFinish() {
 *       this.loadingDone = true;
 *     },
 *     _onAnimationEnd() {
 *       this.animationDone = true;
 *     },
 *     _allDone() {
 *       console.log('go next');
 *     }
 *   }
 * };
 * </script>
 * ```
 *
 * 代码改造后，少了 20 行代码
 *
 * ```vue
 * <template>
 *   <Loading @finish="_onLoadingFinish" />
 *   <Animation @end="_onAnimationEnd" />
 * </template>
 * <script>
 * import createPromise from '@/rpf/un/createPromise';
 * const loadingProm = createPromise();
 * const animationProm = createPromise();
 * export default {
 *   mounted() {
 *     Promise.all([
 *       api.postLogin(),
 *       loadingProm.done,
 *       animationProm.done
 *     ]).then(() => {
 *         this._allDone();
 *     });
 *   },
 *   methods: {
 *     _onLoadingFinish() {
 *       loadingProm.resolve();
 *     },
 *     _onAnimationEnd() {
 *       animationProm.resolve();
 *     },
 *     _allDone() {
 *       console.log('go next');
 *     }
 *   }
 * };
 * </script>
 * ```
 *
 */
export default function createPromise() {
  /** @type { (value: any) => void } */
  let resFn = null;

  /** @type { (value: any) => void } */
  let rejFn = null;

  const prom = new Promise((resolve, reject) => {
    resFn = resolve;
    rejFn = reject;
  });
  return {
    done: prom,
    resolve: resFn,
    reject: rejFn
  };
}
