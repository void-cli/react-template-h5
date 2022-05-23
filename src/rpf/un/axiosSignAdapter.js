/* eslint-disable import/no-unresolved */
import md5 from 'md5';
import axios from 'axios';
import { asFunction, asNonNullable, asString } from './verify-type';

/**
 * axios 签名适配器，用于迷惑恶意用户，防止接口被刷；
 *
 * 相关文档：https://tzxmcy.yuque.com/tzxmcy/wiki/ix2o1x#eHGfX
 *
 * - 需要用到 md5 库（ `npm i -S md5` ）
 *
 * @example
 *
 * ```js
 * import axios from 'axios';
 * import axiosSignAdapter from '@/rpf/un/axiosSignAdapter';
 *
 * const ins = axios.create({
 *   baseURL: 'https://...',
 *   timeout: 10 * 1000
 * });
 *
 * const TOKEN_KEY = '';
 *
 * axiosSignAdapter(ins, '加密盐1', {
 *   confuseSalt: '加密盐2',
 *   getToken: async () => {
 *     // 微信
 *     return localStorage.getItem(TOKEN_KEY);
 *     // APG
 *     const openId = await getOpenId();
 *     return localStorage.getItem(openId + TOKEN_KEY);
 *   }
 * });
 * ```
 *
 * @param {import('axios').AxiosInstance} axiosIns axios实例
 * @param {string} salt 加密盐字符串，对接接口前与服务端先商定一个固定值
 * @param {object} options
 * @param {string} options.confuseSalt 迷惑加密盐字符串，对接接口前与服务端先商定一个固定值
 * @param {() => string | Promise<string>} options.getToken 获取函数，会将返回值自动设置到 `Authorization` 头部
 */
export default function axiosSignAdapter(
  axiosIns,
  salt,
  { confuseSalt = '_salt_', getToken } = {}
) {
  asNonNullable(axiosIns, 'axios instance is required');
  asString(salt, 'salt is required & should be string');
  asString(confuseSalt, 'confuseSalt is required & should be string');
  asFunction(getToken, 'getToken is required & should be function');

  const tsProm = getTs(axiosIns).then(ts => ts - Date.now());

  const tsPromFn = () => tsProm;

  axiosIns.interceptors.request.use(
    async config => {
      const token = await getToken();
      const serverTimeDiff = await tsPromFn();
      const ts = Date.now() + serverTimeDiff;
      const rnd = Math.random();
      const xSignData = {
        ...config.params,
        ...config.data,
        timestamp: ts,
        nonce: rnd,
        salt
      };
      if (token) {
        xSignData.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['x-timestamp'] = ts;
      config.headers['x-nonce'] = rnd;
      config.headers['x-signature'] = sign(xSignData);
      const confuseRnd = Math.random();
      config.headers.Cookle = `${document.cookie}|${confuseRnd}|${sign({
        ...xSignData,
        nonce: confuseRnd,
        salt: confuseSalt
      })}`;
      return config;
    },
    error => Promise.reject(error)
  );
}

/**
 * 获取时间戳
 * @param {import('axios').AxiosInstance} axiosIns
 * @returns
 */
function getTs(axiosIns) {
  const { baseURL } = axiosIns.defaults;
  return axios
    .get(`${baseURL}/utils/index`)
    .then(res => res.headers['app-timestamp'])
    .catch(err => {
      console.log('axiosSignAdapter', err);
    });
}

/**
 * 签名
 * @param {Record<string, any>} data
 * @returns
 */
function sign(data) {
  const params = { ...data };
  const str = Object.keys(params)
    .filter(k => params[k] !== undefined)
    .sort()
    .map(
      k => `${k}=${params[k] instanceof Date ? params[k].toJSON() : params[k]}`
    )
    .join('&');
  return md5(str);
}
