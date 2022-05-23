/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

const Wrap = styled.div`
  position: relative;
  width: 100px;
  height: 100px;

  > svg {
    transform: rotate(-90deg);
  }
`;

/**
 *
 * SVG 圆形进度条组件
 *
 * @example
 * ```js
 * import React, { useState } from 'react';
 * import styled from 'styled-components/macro';
 * import CircleProgress from 'rpf/react/components/CircleProgress';
 *
 * const MyProgress = styled(CircleProgress)`
 *   width: 200px;
 *   height: 200px;
 * `;
 * const App = props => {
 *   return <MyProgress percent={90} />;
 * };
 * ```
 * @param {object} props
 * @param {number} props.percent 进度值，0 - 100
 * @param {string} props.stroke 未完成进度描边颜色
 * @param {string} props.activeStroke 已完成进度描边颜色
 * @param {number} props.strokeWidth 描边宽度，无单位
 * @param {number} props.size SVG 尺寸，无单位
 * @param {string} props.className 类名
 * @param {Record<string, any>} props.style
 *
 */
const CircleProgress = ({
  children,
  className,
  style,
  size,
  percent,
  strokeWidth,
  stroke,
  activeStroke
}) => {
  const circleR = (size - strokeWidth) / 2;
  const circleRDot = size / 2;
  const circleLength = circleR * Math.PI * 2;
  const offset = circleLength * (1 - percent / 100);

  return (
    <Wrap className={className} style={style}>
      <svg
        className="cp-svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="cp-circle"
          r={circleR}
          cx={circleRDot}
          cy={circleRDot}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circleLength}
          strokeDashoffset="0"
        />
        <circle
          className="cp-circle cp-circle-active"
          r={circleR}
          cx={circleRDot}
          cy={circleRDot}
          fill="transparent"
          stroke={activeStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circleLength}
          strokeDashoffset={circleLength}
          style={{
            strokeDashoffset: offset
          }}
        />
      </svg>
      {children}
    </Wrap>
  );
};

CircleProgress.defaultProps = {
  children: null,
  className: '',
  style: null,
  size: 100,
  percent: 50,
  strokeWidth: 10,
  stroke: '#aaa',
  activeStroke: '#ffbb00'
};

CircleProgress.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  className: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  size: PropTypes.number,
  percent: PropTypes.number,
  strokeWidth: PropTypes.number,
  stroke: PropTypes.string,
  activeStroke: PropTypes.string
};

export default CircleProgress;
