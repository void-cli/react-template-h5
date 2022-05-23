import { asString } from './verify-type';

const PROD_LIFEAPP_DOMAIN = 'https://m3.lifeapp.pingan.com.cn';
const DEV_LIFEAPP_DOMAIN = 'https://stg1-m.lifeapp.pingan.com.cn';

const SCHEMA = 'pars://pars.pingan.com/open_url?type=wx&url=';

/**
 * @typedef {'prod' | 'test' | 'temp' | 'dev'} Env
 */

/**
 * 创建回流链接
 *
 * @example
 * ```js
 * import createBackflowLink from '@/rpf/un/createBackflowLink';
 *
 * // 回流链接
 * const url = createBackflowLink('https://www.rabbitpre.com/', '123456789');
 *
 * // 不含报名页的回流连接
 * const url2 = createBackflowLink(
 *  'https://www.rabbitpre.com/',
 *  '123123123',
 *  {
 *    signup: false // 不使用报名页
 *  }
 * )
 * ```
 * 关于 `signup: false`： 默认情况下应该让客户去配置回流连接是否使用报名页，
 * 特殊情况下可以使用这种方式绕过报名页
 *
 * @param {string} projectUrl 项目链接，一般是斐波链接
 * @param {string} actId 金管家活动id
 * @param {object} options 配置参数
 * @param {Env} options.env 环境，默认 'prod'
 * @param {boolean} options.signup 是否使用报名页，默认 true
 * @returns 回流链接
 */
export default function createBackflowLink(
  projectUrl,
  actId,
  { env = 'prod', signup = true } = {}
) {
  asString(projectUrl);
  asString(actId);

  // 回流页URL
  const extinfoUrl = getExtinfoUrlByEnv(env);
  // 报名页URL
  const signupUrl = signup ? getSignupUrlByEnv(env, actId) : undefined;

  const urls = [extinfoUrl, SCHEMA, signupUrl, projectUrl];

  const url = urls.reverse().reduce(encodeReduceUrl);
  return url;
}

/**
 * 合并url函数，用于 Array.proptype.reduce
 * @param {string} prevUrl
 * @param {string} currentUrl
 */
function encodeReduceUrl(prevUrl, currentUrl) {
  // 去除undefined
  if (!currentUrl) {
    return prevUrl;
  }
  return currentUrl + encodeURIComponent(prevUrl);
}

/**
 * 获取报名页&回流页域名
 * @param {Env} env 运行环境字符串
 */
function getLifeappDomain(env) {
  return env === 'prod' ? PROD_LIFEAPP_DOMAIN : DEV_LIFEAPP_DOMAIN;
}

/**
 * 获取报名页URL
 * @param {Env} env 运行环境字符串
 * @param {string} actId 金管家活动号
 */
function getSignupUrlByEnv(env, actId) {
  const domain = getLifeappDomain(env);
  const url = `${domain}/m/actevo/sign-up/index.html`;
  return `${url}?aid=${actId}&souce=share&redirectUri=`;
}

/**
 * 获取回流页URL
 * @param {Env} env 运行环境字符串
 */
function getExtinfoUrlByEnv(env) {
  return `${getLifeappDomain(env)}/m/actevo/wx-extinfo/index.html?url=`;
}
