/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';

const Text = styled.div`
  display: inline-block;
  white-space: nowrap;
  position: relative;
  color: white;
`;

const Stroke = styled.span`
  position: absolute;
  -webkit-text-stroke: ${p => p.strokeWidth} ${p => p.stroke};
  z-index: 1;
`;

const Main = styled.span`
  position: relative;
  z-index: 2;
`;

/**
 *
 * 描边文本组件
 *
 * @example
 * ```js
 * import React from 'react';
 * import StrokeText from './rpf/react/components/StrokeText';
 * import styled from 'styled-components/macro';
 *
 * const MyStrokeText = styled(StrokeText)`
 *   color: green;
 *   font-size: 32px;
 * `;
 *
 * class App extends React.Component {
 *   render() {
 *     return (
 *       <MyStrokeText text="带描边的文字" stroke="red" strokeWidth="0.1em" />
 *     );
 *   }
 * }
 * ```
 *
 * @param {object} props
 * @param {string} props.text 渲染的文本
 * @param {string} props.stroke 描边颜色，默认 `#000`
 * @param {string} props.strokeWidth 描边大小，默认 `5px`
 * @param {any[]} props.restProps 其他属性
 *
 */
const StrokeText = props => {
  const { text, strokeWidth, stroke, ...restProps } = props;
  return (
    <Text {...restProps}>
      <Stroke strokeWidth={strokeWidth} stroke={stroke}>
        {text}
      </Stroke>
      <Main>{text}</Main>
    </Text>
  );
};

StrokeText.defaultProps = {
  text: '',
  stroke: '#000',
  strokeWidth: '5px'
};

StrokeText.propTypes = {
  text: PropTypes.string,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.string
};

export default StrokeText;
