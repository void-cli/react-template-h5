/* eslint-disable import/no-extraneous-dependencies */
// https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isIOS from '../../un/isIOS';

const envIOS = isIOS();

/**
 *
 * 外部点击事件组件
 *
 * @example
 * ```js
 * import React from 'react';
 * import ClickOutside from './rpf/react/components/ClickOutside';
 *
 * const App = props => {
 *   return (
 *     <ClickOutside
 *       onClickOutside={() => {
 *         console.log('click outside');
 *       }}
 *     >
 *       <div>some elements</div>
 *     </ClickOutside>
 *   );
 * };
 * ```
 *
 * @param {object} props
 * @param {Function} props.onClickOutside (Function): 外部点击事件回调函数，必填
 * @param {string} props.as (String): 渲染标签名，默认 `div`
 * @param {Record<string, any>} props.restProps 接收其他任意合法的 dom props
 *
 */
const ClickOutside = ({ children, onClickOutside, as, ...restProps }) => {
  const containerRef = useRef();
  const cbRef = useRef();
  const isTouchRef = useRef(false);
  useLayoutEffect(() => {
    cbRef.current = onClickOutside;
  });
  useLayoutEffect(() => {
    let t = null;
    function docClick(e) {
      if (e.type === 'touchend') isTouchRef.current = true;
      if (e.type === 'click' && isTouchRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        t = setTimeout(() => {
          cbRef.current && cbRef.current();
          // FIXME, 360ms delay to be compatible with click event delay, could be better
        }, 360);
      }
    }
    if (envIOS) {
      document.addEventListener('touchend', docClick, true);
    }
    document.addEventListener('click', docClick, true);
    return () => {
      clearTimeout(t);
      if (envIOS) {
        document.removeEventListener('touchend', docClick, true);
      }
      document.removeEventListener('click', docClick, true);
    };
  }, []);

  const Tag = `${as}`;
  return (
    <Tag ref={containerRef} {...restProps}>
      {children}
    </Tag>
  );
};

ClickOutside.defaultProps = {
  as: 'div'
};

ClickOutside.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  as: PropTypes.string,
  onClickOutside: PropTypes.func.isRequired
};

export default ClickOutside;
