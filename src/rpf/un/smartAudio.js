import isWeChat from './isWeChat';

const env = {
  wechat: isWeChat()
};

/**
 * 智能音频模块
 *
 * 实现了以下功能:
 * - 尝试自动播放，兼容微信以及某些 App webview
 * - 程序切到后台自动暂停播放
 * - 如果程序切到后台之前，用户没有主动停止播放，程序切到前台自动恢复播放
 *
 * @example React
 * ```js
 * import React, { useEffect, useRef, useState } from 'react';
 * import smartAudio from 'rpf/un/smartAudio';
 *
 * const App = () => {
 *   const [auPaused, setAuPaused] = useState(true);
 *   const auRef = useRef();
 *   useEffect(() => {
 *     const bgmAu = smartAudio(auRef.current, {
 *       onChange: ({ paused }) => {
 *         setAuPaused(paused);
 *       }
 *     });
 *     bgmAu.play();
 *     return () => {
 *       bgmAu.destroy();
 *     };
 *   }, []);
 *   return (
 *     <div>
 *       <audio src={require('./assets/bgm.mp3')} loop ref={auRef} />
 *       <button
 *         onClick={() => {
 *           auPaused ? auRef.current.play() : auRef.current.pause();
 *         }}
 *       >
 *         {auPaused ? '播放' : '暂停'}
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example Vue
 *
 * ```vue
 * <template>
 *   <div>
 *     <audio src="@/assets/bgm.mp3" loop ref="au"></audio>
 *     <button @click="_clickBtn">{{ auPaused ? '播放' : '暂停' }}</button>
 *   </div>
 * </template>
 * <script>
 *   import smartAudio from '@/rpf/un/smartAudio';
 *   export default {
 *     data() {
 *       return {
 *         auPaused: true
 *       };
 *     },
 *     mounted() {
 *       this.bgmAu = smartAudio(this.$refs.au, {
 *         onChange: ({ paused }) => {
 *           this.auPaused = paused;
 *         }
 *       });
 *       this.bgmAu.play();
 *     },
 *     beforeDestroy() {
 *       this.bgmAu && this.bgmAu.destroy();
 *     },
 *     methods: {
 *       _clickBtn() {
 *         this.auPaused ? this.$refs.au.play() : this.$refs.au.pause();
 *       }
 *     }
 *   };
 * </script>
 * ```
 *
 * @param {HTMLAudioElement} $elem 音频元素
 * @param {object} options
 * @param {(paused: boolean) => void} options.onChange 状态变化回调
 * @returns
 */
export default function smartAudio($elem, { onChange } = {}) {
  let pausedByHidden = false;

  function emitChange() {
    onChange &&
      onChange({
        paused: $elem.paused
      });
  }

  function onAuPlay() {
    emitChange();
  }

  function onAuPause() {
    emitChange();
  }

  function play() {
    function playAudio() {
      const prom = $elem.play();
      if (prom) {
        return prom.catch(err => {
          console.error('播放失败', $elem.src, err.message);
          return err;
        });
      }
      return prom;
    }

    return new Promise(resolve => {
      if (env.wechat) {
        if (window.WeixinJSBridge) {
          window.WeixinJSBridge.invoke('getNetworkType', {}, () => {
            resolve(playAudio());
          });
        } else {
          document.addEventListener(
            'WeixinJSBridgeReady',
            () => {
              resolve(playAudio());
            },
            false
          );
        }
      } else {
        resolve(playAudio());
      }
    });
  }

  function pause() {
    return $elem.pause();
  }

  function onDocVisChange() {
    if (document.visibilityState === 'hidden') {
      /* 程序切到后台，暂停播放，并标记 */
      if (!$elem.paused) {
        pausedByHidden = true;
        pause();
      }
    } else if (document.visibilityState === 'visible') {
      /* 程序回到前台，恢复播放 */
      if (pausedByHidden) {
        pausedByHidden = false;
        play();
      }
    }
  }

  function destroy() {
    $elem.removeEventListener('play', onAuPlay);
    $elem.removeEventListener('paued', onAuPause);
    document.removeEventListener('visibilitychange', onDocVisChange);
  }

  $elem.addEventListener('play', onAuPlay);
  $elem.addEventListener('pause', onAuPause);
  document.addEventListener('visibilitychange', onDocVisChange);

  return {
    play,
    pause,
    destroy
  };
}
