/* eslint-disable no-self-compare */
const hasOwn = Object.prototype.hasOwnProperty;

function is(A, B) {
  if (A === B) {
    return A !== 0 || B !== 0 || 1 / A === 1 / B; // +0 !== -0
  }
  return A !== A && B !== B; // NaN
}

/**
 * 比较两个值是否相同
 * `shallowEqual`仅在以下条件返回 **true**:
 *
 * - `Object.is(A,B)`返回 **true**
 * - A,B 都是对象(object,array)且有相同的 key，对于每个 key，调用`Object.is(A[key],B[key])`都返回 **true**
 *
 * @example
 * ```js
 * import shallowEqual from '@/rpf/un/shallowEqual';
 *
 * shallowEqual({ a: 123 }, { a: 123 }); // true
 * shallowEqual({ a: 123 }, { a: 456 }); // false
 * shallowEqual(1, 1); // true
 * shallowEqual(NaN, NaN); // true
 * shallowEqual(0, +0); // true
 * shallowEqual(0, -0); // false
 * shallowEqual(+0, -0); // false
 * ```
 *
 * @param {any} objA
 * @param {any} objB
 */
export default function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
