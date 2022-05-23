/* eslint-disable import/no-extraneous-dependencies */
import qs from 'qs';
import filterQuery from './filterQuery';
import isPARS from './isPARS';

async function getApgOpenId(apgAppId) {
  return new Promise((resolve, reject) => {
    window.PALifeOpen.getOpenId(
      {
        appId: apgAppId
      },
      rsp => {
        if (rsp.ret === '0') {
          resolve(rsp.data.openId);
        } else {
          reject(rsp);
        }
      },
      e => {
        reject(e);
      }
    );
  });
}

/**
 * ### getApgShareUrl({apgAppId,url,omitQuery ,mergeQuery ,nextHash})
 *
 * 金管家环境下获取分享链接，并携带了斐波和金管家的业务参数；
 * 适用场景：所有金管家项目，开发者无需关心斐波和金管家底层的业务逻辑；
 *
 * **示例**
 * @example
 * ```js
 * import getApgShareUrl from './rpf/un/getApgShareUrl';
 * const apgShareUrl = await getApgShareUrl({
 *   apgAppId: '2019061000000174',
 *   url: 'https://apg-pension-tool.j.h5no1.cn/s/e2RPH/1574418758108?test=111'
 * });
 *
 * // 如当前项目地址为：https://www.baidu.com?lc=2 ， 则返回的apgShareUrl的值：https://apg-pension-tool.j.h5no1.cn/s/e2RPH/1574418758108?test=111&lc=2&s_oid=apgOpenid
 * ```
 *
 * **注意**
 * 默认会携带上当前链接上的所有参数再过滤 `omitQuery`，因此如果想替换连接上的参数则使用 `mergeQuery`：
 * @example
 * ```js
 * import getApgShareUrl from './rpf/un/getApgShareUrl';
 * const shareUrl = await getApgShareUrl({
 *   apgAppId: '2019061000000174',
 *   url:'https://apg-pension-tool.j.h5no1.cn/s/e2RPH/1574418758108'
 *   mergeQuery: {
 *     query: 'newQuery'
 *   }
 * });
 * ```
  @param {object} option
 * @param {string} option.appid 商户号 appid
 * @param {string} option.url 广州兔展短链接,例如：https://apg-pension-tool.j.h5no1.cn/s/e2RPH/1574418758108
 * @param {string[]} option.omitQuery 字符串数组，需要去掉的 query 键名，默认 `[]`
 * @param {Record<string, string | number>} option.mergeQuery 需要追加合并的 query 参数键值对集合，默认 `{}`
 * @param {string} option.nextHash  需要变更的 hash, 默认不变更
 * @returns { Promise<string>} Promise:分享链接，携带了斐波和金管家的业参数；
 */
export default async function getApgShareUrl({
  apgAppId,
  url,
  omitQuery = [],
  mergeQuery = {},
  nextHash
}) {
  console.log(
    '\x1b[32m 内部统一方法：获取apg分享链接,自动携带了斐波和apg的业务参数   \x1b[0m'
  );
  if (!isPARS()) {
    throw Error('当前不是apg环境');
  }
  if (typeof url !== 'string') {
    throw Error('url参数是必须的,且必须是短链');
  }
  if (typeof apgAppId !== 'string') {
    throw Error('apgAppId参数必须是字符串');
  }
  if (!window.PALifeOpen) {
    throw Error('缺少PALifeOpen SDK');
  }
  if (!window.fiboSDK) {
    throw Error('缺少fiboSDK');
  }

  let apgOpenid;
  try {
    apgOpenid = await getApgOpenId(apgAppId);
  } catch (error) {
    throw Error(error.message);
  }
  let link = filterQuery(
    url,
    [],
    {
      ...qs.parse(window.location.search, { ignoreQueryPrefix: true }),
      ...mergeQuery,
      s_oid: apgOpenid
    },
    nextHash
  );
  link = filterQuery(link, omitQuery);
  link = window.fiboSDK.dealUrl(link);

  if (!/^http/.test(link)) {
    throw new Error(`link参数不合法：没有协议头:${link}`);
  }

  return link;
}
