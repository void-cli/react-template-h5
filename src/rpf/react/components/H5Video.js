/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import isIOS from '../../un/isIOS';
import isAndroid from '../../un/isAndroid';

const env = {
  ios: isIOS(),
  android: isAndroid()
};

const FFBtn = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 9;
  color: red;
`;

const VideoWrap = styled.div`
  position: relative;
  > video {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
`;

const Frame = styled.div`
  width: 100%;
  height: 100%;
  z-index: 2;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  pointer-events: none;
  background-size: 100%;
  background-repeat: no-repeat;
  opacity: ${p => (p.visible ? 1 : 0)};
`;

/**
 *
 * 拥有良好用户体验的视频组件
 *
 * 解决的问题：
 *
 * - 视频加载时没有第一帧画面（iOS）
 * - 同时渲染多个视频，开始播放另一个视频导致播放完的视频变透明（部分 Android）
 * - 视频开始播放时会出现一些黑色帧（部分 Android）
 * - 加入调试模式，带有播放日志和快进按钮
 *
 * 解决的方法：
 *
 * 渲染 `<video />` 和两个帧图片 `<img />`，在适当的时候，隐藏或者显示第一帧或最后一帧
 *
 * 注意：
 *
 * - 当需要显示或者隐藏组件时，尽量使用 `visibility` 或者 `opacity` 属性实现，避免使用 `display` 或者 `挂载/卸载` 等性能损耗较高的方式
 * - iOS 13.5 的微信在清理缓存之后，会出现视频无法播放，也不抛出错误，只能将微信退出后台重新打开才恢复正常
 *
 * **如何获取视频的第一帧和最后一帧图片**
 *
 * 安装 ffmpeg 之后，运行以下命令
 *
 * ```bash
 * # 获取第一帧
 * ffmpeg -i input.mp4 -vframes 1 first_frame.png
 * # 获取最后一帧
 * ffmpeg -sseof -1 -i input.mp4 -update 1 last_frame.png
 * ```
 *
 * @example
 * ```js
 * import React, { useState } from 'react';
 * import styled from 'styled-components/macro';
 * import H5Video from 'rpf/react/components/H5Video';
 * import vw from 'rpf/un/vw';
 *
 * const MyVideo = styled(H5Video)`
 *   position: absolute;
 *   top: 50%;
 *   left: 0;
 *   transform: translate(0, -50%);
 *   width: ${vw(750)};
 *   height: ${vw(1650)};
 * `;
 * const App = props => {
 *   const [play, setPlay] = useState(false);
 *   const [key, setKey] = useState(0);
 *   return (
 *     <div>
 *       <div>{play ? '播放中...' : '暂停了'}</div>
 *       <button
 *         onClick={() => {
 *           setPlay(play => !play);
 *         }}
 *       >
 *         播放/暂停
 *       </button>
 *       <button
 *         onClick={() => {
 *           setKey(key => key + 1);
 *         }}
 *       >
 *         重置到第一帧
 *       </button>
 *       <MyVideo
 *         key={key}
 *         debug={true}
 *         play={play}
 *         onChange={value => {
 *           setPlay(value);
 *         }}
 *         src={require('./path/to/video.mp4')}
 *         firstFrame={require('./path/to/first_frame.png')}
 *         lastFrame={require('./path/to/last_frame.png')}
 *       />
 *     </div>
 *   );
 * };
 * ```
 *
 * @param {object} options
 * @param {boolean} options.debug 调试模式，输出日志和快进按钮，快进到最后一秒
 * @param {boolean} options.play  播放状态，`true` 为播放，`false` 为暂停
 * @param {(play:boolean)=>void} options.onChange 播放状态回调
 * @param {Function} options.onStart  开始播放回调
 * @param {Function} options.onEnded  结束播放回调
 * @param {string} options.src  视频 URL
 * @param {string} options.firstFrame  第一帧图片 URL
 * @param {string} options.lastFrame  最后一帧图片 URL
 */
const H5Video = ({
  children,
  className,
  style,
  src,
  controls,
  firstFrame,
  lastFrame,
  debug,
  play,
  onStart,
  onChange,
  onEnded
}) => {
  const vRef = useRef();
  const [frame, setFrame] = useState('first');
  const onStartRef = useRef();
  useLayoutEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  const debugLog = useCallback(
    (...args) => {
      if (debug) {
        console.log('H5Video', ...args);
      }
    },
    [debug]
  );

  useLayoutEffect(() => {
    function onStartCb() {
      onStartRef.current?.();
    }
    function onFirstFrame() {
      onStartCb();
      setFrame(null);
    }
    const $vElem = vRef.current;
    let playTs = 0;
    function onPlay() {
      debugLog('to play', Date.now() - playTs);
      onFirstFrame();
      $vElem.removeEventListener('play', onPlay);
    }
    function onPlaying() {
      debugLog('to playing', Date.now() - playTs);
      $vElem.removeEventListener('playing', onPlaying);
    }
    function onTimeUpdate() {
      debugLog('to timeupdate', Date.now() - playTs);
      onFirstFrame();
      $vElem.removeEventListener('timeupdate', onTimeUpdate);
    }

    if (play) {
      setFrame(s => (s !== null ? 'first' : null));
      let playProm = null;
      playTs = Date.now();
      if (window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke('getNetworkType', {}, () => {
          debugLog('to getNetworkType', Date.now() - playTs);
          playProm = $vElem.play();
        });
      } else {
        playProm = $vElem.play();
      }
      if (playProm) {
        playProm.catch(err => {
          debugLog('play error', err.message);
        });
      }

      if (env.android) {
        $vElem.addEventListener('timeupdate', onTimeUpdate);
      } else {
        $vElem.addEventListener('play', onPlay);
        $vElem.addEventListener('playing', onPlaying);
      }
    } else {
      $vElem.pause();
    }
    return () => {
      $vElem.removeEventListener('timeupdate', onTimeUpdate);
      $vElem.removeEventListener('play', onPlay);
      $vElem.removeEventListener('playing', onPlaying);
    };
  }, [play, debugLog]);
  return (
    <VideoWrap className={className} style={style}>
      <video
        crossOrigin="anonymous"
        preload="auto"
        ref={vRef}
        src={src}
        x5-video-player-type="h5-page"
        mtt-playsinline="true"
        webkit-playsinline="true"
        playsInline
        controls={controls}
        onPlay={() => {
          onChange?.(true);
        }}
        onPause={() => {
          onChange?.(false);
        }}
        onEnded={() => {
          setFrame('last');
          onEnded?.();
        }}
        poster={firstFrame}
      />
      {env.android ? (
        <Frame
          style={{
            backgroundImage: `url('${firstFrame}')`
          }}
          visible={frame === 'first'}
        />
      ) : null}
      <Frame
        style={{
          backgroundImage: `url('${lastFrame}')`
        }}
        visible={frame === 'last'}
      />
      {children}
      {debug && play ? (
        <FFBtn
          onClick={() => {
            vRef.current.currentTime = vRef.current.duration - 1;
          }}
        >
          快进
        </FFBtn>
      ) : null}
    </VideoWrap>
  );
};

H5Video.defaultProps = {
  className: '',
  style: null,
  firstFrame: null,
  lastFrame: null,
  controls: false,
  debug: false,
  play: false,
  onStart: null,
  onChange: null,
  onEnded: null
};

H5Video.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  className: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  src: PropTypes.string.isRequired,
  firstFrame: PropTypes.string,
  lastFrame: PropTypes.string,
  controls: PropTypes.bool,
  debug: PropTypes.bool,
  play: PropTypes.bool,
  onStart: PropTypes.func,
  onChange: PropTypes.func,
  onEnded: PropTypes.func
};

export default H5Video;
