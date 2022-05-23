import axios from 'axios';
import { asBoolean, asString } from './verify-type';

const AXIOS_CONFIG = {
  timeout: 10 * 1000,
  withCredentials: true,
  baseURL: 'https://api.j.h5no1.cn/s/api'
};

/**
 * 动态生成短链
 *
 * @example
 *
 * ```js
 * import createShortLink from './un/createShortLink.js';
 *
 * const shortLink = await createShortLink('原链接', '短链平台token');
 * ```
 *
 * @param {string} url 需要生成短链的原链接
 * @param {string} token 从短链平台获取的 token
 * @param {boolean} withTimestamp 短链是否需要带时间戳二级路径。
 * @returns  短链
 */
export default function createShortLink(url, token, withTimestamp = true) {
  asString(url || null, '检查 [url] 参数');
  asString(token || null, '检查 [token] 参数');
  asBoolean(withTimestamp || null, '检查 [withTimestamp] 参数');

  const params = { url, token };

  return axios
    .post('/client/link/create', params, { ...AXIOS_CONFIG })
    .then(res => {
      if (res.data?.ok === true) {
        /** @type {string} */
        const link = res.data.result.short_link;

        return withTimestamp ? `${link}/${Date.now()}` : link;
      }
      return Promise.reject(res);
    });
}
