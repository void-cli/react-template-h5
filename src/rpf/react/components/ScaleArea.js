/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

import { useMemo } from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

const HPW = window.innerHeight / window.innerWidth;
const getHeightPercent = tagHPW => {
  const percent = HPW / tagHPW;
  return Math.min(1, percent);
};

const Wrap = styled.div`
  transform: scale(${p => p.scaleX}, ${p => p.scaleY});
`;

/**
 *  * H5 缩放适配组件，用于解决在微信授权后底部出现导航栏，导致未被遮挡区域的高度小于参数 `minHPW` 中指定的高度（即除数），minHPW 默认为 `1206 / 750` 为 h5 显示的安全区域，该组件将会以当前的视图宽高进行等比例缩放显示，同样适用于部分短屏手机。
 *
 * [iPhone 主要机型微信浏览器尺寸参考](http://wiki.tuzhanai.com/pages/viewpage.action?pageId=59514385#id-%E5%B8%83%E5%B1%80%E9%80%82%E9%85%8D%E8%A7%84%E8%8C%83-iPhone%E4%B8%BB%E8%A6%81%E6%9C%BA%E5%9E%8B%E5%BE%AE%E4%BF%A1%E6%B5%8F%E8%A7%88%E5%99%A8%E5%B0%BA%E5%AF%B8%E5%8F%82%E8%80%83)
 *
 * 微信端导航栏表现：
 *
 * - `window.innerHeight` 在导航栏出现前后有差值
 * - 不触发 window 的 `resize` 事件
 * - `@media (min/max-aspect-ratio)` 的媒体查询只能获取的导航栏出现前的比例
 *
 *
 * **示例**
 * @example
 * ```jsx
 * import ScaleArea from 'rpf/react/components/ScaleArea';
 * import styled from 'styled-components/macro';
 * import vw from 'rpf/un/vw';
 *
 * const SafeArea = styled.div`
 *   position: relative;
 *   width: ${vw(750)};
 *   height: ${vw(1206)};
 *   @media (min-aspect-ratio: 750 / 1206) {
 *     height: 100%;
 *   }
 * `;
 *
 * const Content = styled.div`
 *   position: absolute;
 *   width: ${vw(700)};
 *   left: 0;
 *   right: 0;
 *   top: ${vw(50)};
 *   margin: auto;
 *   height: ${vw(1100)};
 *   background-color: rgb(73, 141, 231);
 * `;
 *
 * const PageWrap = styled.div`
 *   width: 100vw;
 *   height: 100vh;
 *   position: absolute;
 *   left: 0;
 *   top: 0;
 *   display: flex;
 *   justify-content: center;
 *   align-items: center;
 *   overflow: hidden;
 * `;
 *
 * const App = () => {
 *   return (
 *     <PageWrap>
 *       <SafeArea>
 *         <ScaleArea>
 *           // 将要显示的重要区域放在ScaleArea组件，例如content；同时可配合安全区域使用。
 *           <Content />
 *         </ScaleArea>
 *       </SafeArea>
 *     </PageWrap>
 *   );
 * };
 * export default App;
 * ```
 * @param {object} options
 * @param {number} options.minHPW 最小可显示的安全区域的高度除于宽度 默认为 `1206 / 750`
 * @param {string} options.className 可给组件自定义类
 * @param {object} options.style 可给组件自定义样式
 * @param {boolean} options.scaleX 是否需要 x 轴方向缩放, 默认为 ture
 * @param {boolean} options.scaleY 是否需要 Y 轴方向缩放, 默认为 ture
 */
function ScaleArea({ minHPW, className, style, scaleX, scaleY, children }) {
  const scale = useMemo(() => getHeightPercent(minHPW), [minHPW]);
  return (
    <Wrap
      className={className}
      style={style}
      scaleX={scaleX ? scale : 1}
      scaleY={scaleY ? scale : 1}
    >
      {children}
    </Wrap>
  );
}

ScaleArea.defaultProps = {
  minHPW: 1206 / 750,
  className: null,
  children: null,
  scaleX: true,
  scaleY: true,
  style: null
};

ScaleArea.propTypes = {
  minHPW: PropTypes.number,
  className: PropTypes.string,
  scaleX: PropTypes.bool,
  scaleY: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default ScaleArea;
