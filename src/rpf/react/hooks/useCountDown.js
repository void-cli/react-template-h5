import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/**  

* 倒计时插件，用于需要显示倒计时的日期，通过传入需要倒计时的时间差，返回相应的时间对象，通过解构赋值获取所需相应的时间。
* 
* **示例**
*  @example
* ```jsx
* import useCountDown from './rpf/react/hooks/useCountDown';
* import { useEffect, useState } from 'react';
* const App = props => {
*   const diffTime = 10000;
*   const print = () => console.log('执行结束回调函数');
*   const { timeFormat, Start, Pause } = useCountDown({
*     diffTime,
*     onEnd: print
*   });
*   return (
*     <>
*       <button onClick={Pause}> 暂停</button>
*       <button onClick={Start}>开始</button>
*       <p>距离结束还有</p>
*       {Object.keys(timeFormat).map((item, index) => (
*         <span key={item + index}>
*           {timeFormat?.[item]}
*           {index !== 3 ? ':' : ''}
*         </span>
*       ))}
*     </>
*   );
* };
* ```

* @param {object} options
* @param  {number} options.diffTime 需要倒计时的时间差，单位为 ms，例如 10 秒倒计时，需要传入 10 * 1000
* @param {function} options.onEnd  倒计时结束后执行的回调函数
* @param {boolean} options.isDouble 是否需要返回的日期的格式为两位数，即不足两位前面自动补 0，默认为 true，不填则默认补位
* @returns {{ timeFormat: object, Start: function, Pause: function }} dateFormat: 返回格式化后的时间日时分秒 {days：xx, hours:xx, minutes:xx, seconds:xx}，通过结构赋值获取所需的日期字段 , Start: 倒计时开始 , Pause :暂停倒计时
*/
const useCountDown = ({ diffTime, onEnd, isDouble = true }) => {
  /**
   * @description: 倒计时插件，返回相应的时间对象，通过解构赋值获取所需相应的时间。
   * @param {Number,Function,Boolean}
   * @return {Object,Function,Function}
   */

  if (typeof onEnd !== 'function') {
    throw Error('onEnd should be a function');
  }

  if (typeof diffTime !== 'number') {
    throw Error('diffTime should be an number');
  }

  const [time, setTime] = useState(diffTime);
  const funcRef = useRef();
  const timerRef = useRef();

  // 是否需要返回两位数格式的日期
  const numDeal = useCallback(
    num => {
      if (isDouble) {
        return num < 10 ? `0${num}` : `${num}`;
      }
      return `${num}`;
    },
    [isDouble]
  );

  // 格式化时间格式
  const timeFormat = useMemo(() => {
    const days = Math.floor(time / 1000 / 3600 / 24);
    const hours = Math.floor((time / 1000 / 3600) % 24);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    return {
      days: numDeal(days),
      hours: numDeal(hours),
      minutes: numDeal(minutes),
      seconds: numDeal(seconds)
    };
  }, [time, numDeal]);

  // 执行倒计时
  const CountTime = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTime(curtime => curtime - 1000);
    }, 1000);
  }, []);

  // 开始倒计时
  const Start = () => {
    clearInterval(timerRef.current);
    CountTime();
  };

  // 暂停倒计时
  const Pause = () => {
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    funcRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (time === 0) {
      funcRef.current();
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [time]);

  return {
    timeFormat,
    Start,
    Pause
  };
};

export default useCountDown;
