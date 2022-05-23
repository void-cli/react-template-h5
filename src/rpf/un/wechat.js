/* eslint-disable guard-for-in */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import axios from 'axios';

const ajax = axios.create();

ajax.interceptors.response.use(
  response => {
    const { data } = response;
    if (data && data.code !== 0) {
      return Promise.reject(Error(data.msg || data.message));
    }
    return response;
  },
  error => Promise.reject(error)
);

function isLocalOrIp(hostname) {
  return hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
}

function hasValidHost(host) {
  if (host) {
    return Array.isArray(host) && host.every(item => typeof item === 'string');
  }
  return true;
}

function isValidProp(p) {
  return (
    p &&
    typeof p.appid === 'string' &&
    typeof p.service === 'string' &&
    hasValidHost(p.host)
  );
}

const getQuery = queryName => {
  const reg = new RegExp(`(^|&)${queryName}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
};

const filter = (params, newParams) => {
  params = params || [];
  newParams = newParams || {};
  let { search } = window.location;
  search = search.substr(1, search.length);
  const queryArr = search.split('&');
  const query = {};
  for (let i = 0; i < queryArr.length; i++) {
    if (queryArr[i].length > 0) {
      const temp = queryArr[i].split('=');
      query[temp[0]] = temp[1];
    }
  }
  let newSearch = '';
  // Object.assign(query, newParams);
  let key;
  for (key in newParams) {
    query[key] = newParams[key];
  }
  for (key in query) {
    if (params.indexOf(key) !== -1) {
      continue;
    }
    newSearch = `${newSearch + key}=${query[key]}&`;
  }
  newSearch = newSearch.replace(/&{1}$/, '');

  if (newSearch.length > 0) newSearch = `?${newSearch}`;
  const href =
    window.location.origin +
    window.location.pathname +
    newSearch +
    window.location.hash;
  return href;
};

function parseUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  // hostname + ':' + port = host
  return {
    protocol: a.protocol,
    hash: a.hash,
    search: a.search,
    pathname: a.pathname,
    host: a.host,
    port: a.port,
    hostname: a.hostname,
    origin: a.origin,
    href: a.href
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mergeHost(target, patch) {
  const targetArr = target.split('.').reverse();
  const patchArr = patch.split('.').reverse();
  return targetArr
    .map((item, index) => patchArr[index] || item)
    .reverse()
    .join('.');
}

function fixHost(host = [], url) {
  const pUrl = parseUrl(url);
  let nextHostname = pUrl.hostname;
  if (!/^([.\d]+|localhost)$/.test(nextHostname)) {
    nextHostname = mergeHost(nextHostname, host[randomInt(0, host.length - 1)]);
  }
  return `${pUrl.protocol}//${nextHostname}${pUrl.port ? `:${pUrl.port}` : ''}${
    pUrl.pathname
  }${pUrl.search}${pUrl.hash}`;
}

const authCountKey = 'rpfAuthCnt';
const MAX_AUTH_COUNT = 5;
let authCount = Number(localStorage.getItem(authCountKey));

function setAuthCount(val) {
  authCount = val;
  localStorage.setItem(authCountKey, JSON.stringify(val));
}
setTimeout(() => {
  setAuthCount(0);
}, 3000);

/**
 * 微信JSSDK初始化
 *
 * 参考文档 {@link: http://wiki.tuzhanai.com/pages/viewpage.action?pageId=59514777}
 *
 * 参数:
 * options:
 * - auth: 微信授权配置
 * - jsApi: JSSDK配置
 *
 * @example
 * import wechat from 'rpf/un/wechat';
 *
 * const $wechat = wechat({
 *   auth: {
 *     appid: '',
 *     service: ''
 *   },
 *   jsApi: {
 *     appid: '',
 *     service: '',
 *     host: []
 *   }
 * });
 *
 * $wechat.config();
 *
 * @param {Object} options
 * @returns
 */
function wechat({
  auth = {
    appid: '',
    service: ''
  },
  jsApi = {
    appid: '',
    service: '',
    host: []
  }
} = {}) {
  if (auth && !isValidProp(auth)) {
    throw Error(
      'auth is required & should be { appid: String, service: String }'
    );
  }
  if (jsApi && !isValidProp(jsApi)) {
    throw Error(
      'jsApi is required & should be { appid: String, service: String, host: String[] }'
    );
  }

  const authBaseUrl = `https://${auth.appid}.pro.tuyoumi.com/${auth.service}-open-service`;
  const jsApiBaseUrl = `https://pro.tuyoumi.com/${jsApi.service}-open-service`;

  return {
    // methods using auth
    goTwoAuth: (scope, state, redirectUri) => {
      if (jsApi.host && jsApi.host.length) {
        redirectUri = fixHost(jsApi.host, redirectUri);
      }

      if (!auth.appid) {
        throw Error('未提供 auth.appid');
      }
      if (!auth.service) {
        throw Error('未提供 auth.service');
      }

      if (authCount >= MAX_AUTH_COUNT) {
        alert('授权过于频繁');
        setAuthCount(0);
        return;
      }
      authCount++;
      setAuthCount(authCount);

      const url = authBaseUrl.concat(
        '/web/two/auth/',
        auth.appid,
        '?scope=',
        scope,
        '&state=',
        state,
        '&redirecturi=',
        encodeURIComponent(redirectUri)
      );

      // 尝试排在 Promise 后面
      setTimeout(() => {
        window.location.replace(url);
      }, 0);
    },

    getOpenid: () => {
      const code = getQuery('code');
      if (!code) {
        throw Error('wechat.getOpenid 缺少 code');
      }
      return ajax
        .post(`${authBaseUrl}/web/openid`, {
          appid: auth.appid,
          code
        })
        .then(res => res.data.data);
    },

    getUserInfo: () => {
      const code = getQuery('code');
      if (!code) {
        throw Error('wechat.getUserInfo 缺少 code');
      }
      return ajax
        .post(`${authBaseUrl}/web/user_info`, {
          appid: auth.appid,
          code
        })
        .then(res => res.data.data);
    },

    getSubscribe: openid => {
      if (!openid) {
        throw Error('wechat.getSubscribe 缺少 openid');
      }
      return ajax
        .post(`${authBaseUrl}/web/subscribe`, {
          appid: auth.appid,
          openid
        })
        .then(
          res =>
            /* { subscribe: 1 | 0 } */
            res.data.data
        );
    },

    // methods using jsApi
    config: ({
      debug = false,
      jsApiList = [
        'checkJsApi',
        'chooseImage',
        'onMenuShareTimeline',
        'onMenuShareAppMessage'
      ],
      openTagList = []
    } = {}) => {
      if (!jsApi.appid) {
        throw Error('未提供 jsApi.appid');
      }
      if (!jsApi.service) {
        throw Error('未提供 jsApi.service');
      }

      if (isLocalOrIp(window.location.hostname)) {
        console.warn('.config() 需要部署到线上环境才能正常测试');
      }

      const url = window.location.href.replace(/#{1}.*/, '');
      return ajax
        .post(`${jsApiBaseUrl}/web/sign?t=${Date.now()}`, {
          appid: jsApi.appid,
          url
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 0) {
            window.wx.config({
              debug,
              appId: data.appId,
              timestamp: data.timestamp,
              nonceStr: data.nonceStr,
              signature: data.signature,
              jsApiList,
              openTagList
            });
          }
          return res.data;
        });
    },

    // common methods
    getQuery,
    filter
  };
}

export default wechat;

export const authScope = {
  snsapi_base: 'snsapi_base',
  snsapi_userinfo: 'snsapi_userinfo'
};
