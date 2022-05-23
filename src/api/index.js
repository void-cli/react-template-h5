/* 
  API 模块
  规范文档：https://www.yuque.com/tzxmcy/wiki/ix2o1x#FXdfh
*/
import axios from 'axios';
import axiosSignAdapter from 'rpf/un/axiosSignAdapter';
import getQuery from 'rpf/un/getQuery';
import { BaseApi } from './api.base';
import mock from './mock';
class Api extends BaseApi {}

const {
  api: { baseUrl }
} = window?.$TZ_CONFIG?.conf;
const query = getQuery();

/* 
  handleApiRes 更好的接口错误处理
  用法参考规范文档里的错误处理
  可以根据实际情况，进行调整
*/
export function handleApiRes(promise, ignoreErrorCodes = []) {
  return promise
    .then(res => [null, res])
    .catch(err => {
      console.log(err);
      if (err.type === 'api') {
        // 处理非忽略的报错，-1004 是跟后端约定的鉴权失败错误
        if (![...ignoreErrorCodes, -1004].includes(err.data.error_code)) {
          // 可以在这自定义弹出接口报错弹窗
          // modal.open({type: 'api'});
          window.Sentry?.withScope(function (scope) {
            const { url, baseURL, method } = err.config;
            const path = url.replace(baseURL, '');
            // 根据请求方法和路径进行分组
            scope.setFingerprint([method, path]);
            window.Sentry?.captureException(err);
          });
        }
      } else {
        // 可以在这自定义弹出网络报错弹窗
        // modal.open({type: 'network'});
        window.Sentry?.captureException(err);
      }
      return [err, null];
    });
}

// 是否正式环境
const isProd = process.env.REACT_APP_CONFIG_ENV === 'prod';
const ins = axios.create({
  // 非正式环境并且链接带有 mock 参数，使用 mock 接口
  baseURL: !isProd && query.mock ? baseUrl.replace('test', 'mock') : baseUrl,
  timeout: 10 * 1000
});

//非正式环境并且链接带有 local_mock 参数, 使用前端本地 mock
if (!isProd && query.local_mock) {
  mock(ins);
}

/* 
  详情查看：
  https://tzxmcy.yuque.com/tzxmcy/wiki/ix2o1x#eHGfX 
  https://new2.h5no1.com/rpf-docs/#axiossignadapteraxiosins-salt-confuse
*/
axiosSignAdapter(ins, '加密盐1', {
  confuseSalt: '加密盐2',
  getToken: async () => {
    // 微信
    // return localStorage.getItem(TOKEN_KEY);
    // 金管家
    // const openId = await getOpenId();
    // return localStorage.getItem(openId + TOKEN_KEY);
  }
});

const api = new Api(ins);

api.http.interceptors.response.use(
  function (response) {
    // 一个错误拦截示例，在接口返回 `{ok: false}` 的时候，抛出错误
    const { data, config } = response;

    // token 无效的统一错误码
    if (data && data.error_code === api.ERR_CODE.PERMISSIONS_ERROR) {
      // 重新获取 token ...
    }

    if (data && !data.ok) {
      const { url, baseURL } = config;
      // msg 可以根据需要调整
      let msg = `${config.method}:${url.replace(baseURL, '')}=>${data.message}`;
      if (config.params) {
        msg += 'params:' + JSON.stringify(config.params);
      }
      if (config.data) {
        msg += 'data:' + JSON.stringify(config.data);
      }
      const err = Error(msg);
      // 为 Sentry 上报提供额外信息
      err.type = 'api';
      err.config = config;
      err.data = data;
      return Promise.reject(err);
    }
    // Do something with response data
    return response;
  },
  function (error) {
    // 可以用这个条件判断请求超时
    if (error.code === 'ECONNABORTED') {
      console.log('请求超时');
    }
    return Promise.reject(error);
  }
);

export default api;
