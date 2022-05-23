let prefix = '';

function validateInvoke(curPrefix, name) {
  if (!curPrefix) {
    throw Error(`set prefix before calling .${name}`);
  }
}

/**
 * 私有化的 localStorage，用于需要给 localStorage 存储键名添加前缀的场景
 *
 * 例如，服务端接口使用 token 校验权限，token 通过用户 openid 换取，为了不让用户每次访问页面都执行授权逻辑，我们使用 localStorage 存储 token，但是如果存储 token 的键名不变，不同用户在相同设备访问页面都会使用之前存在的 token。此时，我们可以使用 privateStorage，将 token 存储键名与用户 openid 关联起来。
 *
 * @example
 * ```js
 * import privateStorage from './rpf/un/privateStorage';
 *
 * const tokenStoreKey = `${projectName}-token`;
 *
 * async function init() {
 *   const { openId } = await someSdk.getOpenId();
 *   // 每次页面初始化时，都先设置前缀
 *   privateStorage.setPrefix(openId);
 *   const { token } = await login({ openId });
 *
 *   // 等同于 localStorage.setItem(openId + tokenStoreKey, res.token);
 *   privateStorage.setItem(tokenStoreKey, token);
 *
 *   // 等同于 localStorage.getItem(openId + tokenStoreKey);
 *   privateStorage.getItem(tokenStoreKey);
 * }
 *
 * init();
 * ```
 *
 * 由于 ES 模块的缓存特性，在不同文件引入 privateStorage 都可以得到同一个对象，且 privateStorage 提供了与 localStorage 相同的 API，只需要少量的重构即可完成迁移。
 */
const privateStorage = {
  /**
   * 设置存储键名前缀，在调用其他方法前必须先正确调用一次
   * @param {string} val
   */
  setPrefix(val) {
    if (typeof val !== 'string') {
      throw Error('prefix should be string');
    }
    prefix = val;
  },

  /**
   * 同 localStorage.getItem
   * @param {string} key
   */
  getItem(key) {
    validateInvoke(prefix, 'getItem');
    return localStorage.getItem(prefix + key);
  },

  /**
   * 同 localStorage.setItem
   * @param {string} key
   * @param {any} value
   */
  setItem(key, value) {
    validateInvoke(prefix, 'setItem');
    return localStorage.setItem(prefix + key, value);
  },

  /**
   * 同 localStorage.removeItem
   * @param {string} key
   */
  removeItem(key) {
    validateInvoke(prefix, 'removeItem');
    return localStorage.removeItem(prefix + key);
  }
};

export default privateStorage;
