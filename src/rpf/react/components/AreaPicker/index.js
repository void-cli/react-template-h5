/* eslint-disable import/no-extraneous-dependencies */
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import rawData from './data';

const dataIndexes = rawData.indexes.split(',');

function decode(name) {
  if (typeof name !== 'string') {
    return name;
  }
  return name
    .replace(/S/g, '省')
    .replace(/s/g, '市')
    .replace(/z/g, '州')
    .replace(/q/g, '区')
    .replace(/x/g, '县');
}

function parseName(name) {
  if (name === '-1') {
    return null;
  }
  return name;
}

function tryIndexes(name) {
  return dataIndexes[name] || name;
}

function processName(name) {
  return decode(tryIndexes(parseName(name)));
}

const data = rawData.data.split('\n').map(line => {
  const [name, parent] = line.split(',');
  return {
    name: processName(name),
    parent: processName(parent)
  };
});

const provinceData = data.filter(item => !item.parent);

function Options(props) {
  return props.list.map(item => (
    <option key={item.name} value={item.name}>
      {item.name}
    </option>
  ));
}

/**
 *
 * 省市区选择器
 *
 * @example
 * ```js
 * import React, { useState } from 'react';
 * import AreaPicker from './rpf/react/components/AreaPicker';
 * import styled from 'styled-components/macro';
 *
 * const Wrap = styled.div`
 *   select:nth-child(1) {
 *     color: red;
 *   }
 *   select:nth-child(2) {
 *     color: green;
 *   }
 *   select:nth-child(3) {
 *     color: blue;
 *   }
 * `;
 *
 * const App = props => {
 *   const [pick, setPick] = useState([]);
 *   // 验证是否没选完
 *   const isInvalid = pick.some(item => item === '');
 *   return (
 *     <Wrap>
 *       <AreaPicker
 *         value={pick}
 *         onChange={({ value }) => {
 *           setPick(value);
 *         }}
 *       />
 *     </Wrap>
 *   );
 * };
 * ```
 *
 * 自定义渲染
 *
 * ```js
 * import React, { useState } from 'react';
 * import AreaPicker from './rpf/react/components/AreaPicker';
 *
 * const App = props => {
 *   const [pick, setPick] = useState([]);
 *   const [province, city, region] = pick;
 *   return (
 *     <div>
 *       <p>{pick.join(',')}</p>
 *       <AreaPicker
 *         value={pick}
 *         render={({ provinceData, cityData, regionData }) => {
 *           return (
 *             <div>
 *               <ul>
 *                 {provinceData.map(item => {
 *                   return (
 *                     <li
 *                       style={{
 *                         color: province === item.name ? 'red' : undefined
 *                       }}
 *                       key={item.name}
 *                       onClick={() => {
 *                         setPick([item.name]);
 *                       }}
 *                     >
 *                       {item.name}
 *                     </li>
 *                   );
 *                 })}
 *               </ul>
 *               <ul>
 *                 {cityData.map(item => {
 *                   return (
 *                     <li
 *                       style={{
 *                         color: city === item.name ? 'red' : undefined
 *                       }}
 *                       key={item.name}
 *                       onClick={() => {
 *                         setPick([province, item.name]);
 *                       }}
 *                     >
 *                       {item.name}
 *                     </li>
 *                   );
 *                 })}
 *               </ul>
 *               <ul>
 *                 {regionData.map(item => {
 *                   return (
 *                     <li
 *                       style={{
 *                         color: region === item.name ? 'red' : undefined
 *                       }}
 *                       key={item.name}
 *                       onClick={() => {
 *                         setPick([province, city, item.name]);
 *                       }}
 *                     >
 *                       {item.name}
 *                     </li>
 *                   );
 *                 })}
 *               </ul>
 *             </div>
 *           );
 *         }}
 *       />
 *     </div>
 *   );
 * };
 * ```
 * @param {object} props
 * @param {string[]} props.value 当前选择的值
 * @param {Function} props.onChange 值改变时的回调函数
 * @param {number} props.level 选择级别, 可为 `[1,2,3]` 其中任意值，默认 `3`
 * @param {(provinceData: [Record<string, any>], cityData: [Record<string, any>], regionData: [Record<string, any>]) => Dom} props.render 自定义渲染函数
 *
 */
const AreaPicker = ({ value, render, level, onChange }) => {
  const [provinceVal, cityVal, regionVal] = value;
  const cityData = useMemo(
    () => data.filter(item => item.parent === provinceVal),
    [provinceVal]
  );
  const regionData = useMemo(
    () => data.filter(item => item.parent === cityVal),
    [cityVal]
  );

  if (render) {
    return render({
      provinceData,
      cityData,
      regionData
    });
  }
  return (
    <>
      <select
        value={provinceVal}
        onChange={e => {
          const { value: curValue } = e.target;
          const curCityData = data.filter(item => item.parent === curValue);
          onChange?.({
            value: curCityData.length ? [curValue, ''] : [curValue]
          });
        }}
      >
        <option value="">（省）</option>
        <Options list={provinceData} />
      </select>
      {level >= 2 ? (
        <select
          value={cityVal}
          onChange={e => {
            const { value: curValue } = e.target;
            const curRegionData = data.filter(item => item.parent === curValue);
            onChange?.({
              value: curRegionData.length
                ? [provinceVal, curValue, '']
                : [provinceVal, curValue]
            });
          }}
        >
          <option value="">（市）</option>
          <Options list={cityData} />
        </select>
      ) : null}
      {level >= 3 ? (
        <select
          value={regionVal}
          onChange={e => {
            const { value: curValue } = e.target;
            onChange?.({
              value: [provinceVal, cityVal, curValue]
            });
          }}
        >
          <option value="">（区）</option>
          <Options list={regionData} />
        </select>
      ) : null}
    </>
  );
};

AreaPicker.propTypes = {
  value: PropTypes.oneOf([PropTypes.array]),
  level: PropTypes.oneOf([1, 2, 3]),
  render: PropTypes.oneOf([PropTypes.func]),
  onChange: PropTypes.oneOf([PropTypes.func])
};

AreaPicker.defaultProps = {
  value: [],
  level: 3,
  render: null,
  onChange: null
};

export default AreaPicker;
