/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import vw from '../../un/vw';

const Wrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @media (min-aspect-ratio: 750 / 1000) {
    width: ${vw(750)} !important;
    height: ${vw(1206)} !important;
    transform-origin: top center !important;
    margin: auto;
  }
`;

/**
 * ### component: `<ScaleRoot />`
 *
 * H5 根节点缩放适配组件，用于解决在 PC 端宽屏预览问题，在宽高比小于 `750 / 1000` 的视口中，将以 `750 * 1206` 的比例左右居中上下贴边显示
 *
 * **props**
 *
 * - 任何 DOM 属性
 *
 * @example
 *
 * ```js
 * import ScaleRoot from 'rpf/react/components/ScaleRoot';
 * const App = () => {
 *   return <ScaleRoot>{children}</ScaleRoot>
 * };
 * ```
 */
const ScaleRoot = ({ style, ...restProps }) => {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    function onWinResize() {
      if (window.matchMedia('(min-aspect-ratio: 750 / 1000)').matches) {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const rootH = winW * (1206 / 750);
        setScale(winH / rootH);
      } else {
        setScale(1);
      }
    }
    onWinResize();
    window.addEventListener('resize', onWinResize);
    return () => window.removeEventListener('resize', onWinResize);
  }, []);
  return (
    <Wrap
      {...restProps}
      style={{
        ...style,
        transform: `scale(${scale})`
      }}
    />
  );
};

ScaleRoot.defaultProps = {
  style: null
};

ScaleRoot.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default ScaleRoot;
