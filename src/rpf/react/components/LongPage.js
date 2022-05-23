/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import Scrollbar from 'smooth-scrollbar';
import preventScroll from '../../un/preventScroll';

const Wrap = styled.div`
  -webkit-tap-highlight-color: transparent;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: absolute;
  &[data-scrollbar] {
    position: absolute;
  }
`;

/**
 *
 * 长页面容器
 *
 * - 使用 `rpf/un/preventScroll` 和 `smooth-scrollbar` 实现
 * - 支持滚动条自定义样式
 * - 阻止页面弹性过渡滚动
 *
 * **性能优化**
 *
 * 如果滚动内容中存在过大元素导致滚动卡顿，可以尝试将该元素改为一个不带子元素的独立元素，并加上 `transform: translateZ(0)`
 *
 * **props**
 * - options(object) 传递给 `smooth-scrollbar` 的配置，默认 `{}`, 可参考 https://github.com/idiotWu/smooth-scrollbar/tree/develop/docs#available-options-for-scrollbar
 *
 * @example
 * ```js
 * import React from 'react';
 * import LongPage from './rpf/react/components/LongPage';
 * import styled from 'styled-components/macro';
 *
 * // 滚动条自定义样式
 * const MyLongPage = styled(LongPage)`
 *   .scrollbar-track-y {
 *     background-color: pink;
 *     .scrollbar-thumb {
 *       background-color: yellow;
 *     }
 *   }
 * `;
 *
 * const App = props => {
 *   return (
 *     <MyLongPage
 *       options={{
 *         alwaysShowTracks: true
 *       }}
 *     >
 *       <div>super long content ...</div>
 *       <div
 *         class="super-large-element"
 *         style={{
 *           transform: 'translateZ(0)'
 *         }}
 *       />
 *     </MyLongPage>
 *   );
 * };
 * ```
 */
const LongPage = forwardRef((props, ref) => {
  const wrapRef = useRef();
  const optionsRef = useRef();
  useEffect(() => {
    optionsRef.current = props.options;
  });
  useEffect(() => {
    const prevent = preventScroll();
    const scroll = Scrollbar.init(wrapRef.current, optionsRef.current);
    if (ref) {
      ref.current = scroll;
    }
    return () => {
      prevent.cancel();
      scroll.destroy();
    };
  }, [ref]);
  return <Wrap ref={wrapRef} {...props} />;
});

LongPage.defaultProps = {
  options: {}
};

LongPage.propTypes = {
  options: PropTypes.oneOfType([PropTypes.object])
};

export default LongPage;
