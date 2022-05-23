/* globals PALifeOpenH5 PARelationalLink fiboSDK */
import qs from 'qs';
import filterQuery from './filterQuery';
import asyncLoadJS from './asyncLoadJS';
import isPARS from './isPARS';
import createBackflowLink from './createBackflowLink';

function validateStr(name, value, required = false) {
  if (required && !value) {
    throw Error(
      `内部统一方法：PALandingPageSdk ${name} is required and should be string`
    );
  }
  if (value && (typeof value !== 'string' || !value.length)) {
    throw Error(`内部统一方法：PALandingPageSdk ${name} is should be string`);
  }
}

function handlePaTrackValue(fn, name) {
  fn.then(xhr => {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.requestSendBody);
      data.data = decodeURIComponent(data.data);
      console.log(`金管家外部埋点-${name}:`, data);
    } else {
      console.error(`金管家外部埋点-${name} 失败!`);
    }
  }).catch(() => {
    console.error(`金管家外部埋点-${name} 失败!`);
  });
}

// 合并当前链接上的参数到传入的 url 中
function megerSearchToUrl(url, query, channelKey) {
  const mergeQueryUrl = filterQuery(url, [], query);
  const baseUrl = filterQuery(mergeQueryUrl, [channelKey]);
  const search = qs.parse(baseUrl.split('?')[1]);
  if (!search.s_oid) {
    console.error('当前链接缺少s_oid查询参数');
  }
  return baseUrl;
}

// 处理未初始化提醒
function handleNotInit(isInit) {
  if (!isInit) {
    throw Error('内部统一方法：PALandingPageSdk 请先初始化！');
  }
}

// 动态引入关系链sdk地址
function getPARelationalLinkSDK({ appKey, env }) {
  return new Promise(resolve => {
    const sdkUrl = `https://${
      env === 'prod' ? 'elis-ecocdn' : 'stg1-m.lifeapp'
    }.pingan.com.cn/m/cdn/PARelationalLink/2.3.1/PARelationalLink.min.js?key=${appKey}`;
    asyncLoadJS(sdkUrl)
      .then(() => {
        resolve();
      })
      .catch(() => {
        console.log('load PARelationalLink SKD fail');
      });
  });
}

/**
 * 金管家项目外部 落地页 SDK
 * 相关文档:
 *
 * - 金管家外部埋点：https://www.yuque.com/tzxmcy/wiki/gc9h7r#UKtwt
 *
 * - 斐波埋点：https://tzxmcy.yuque.com/tzxmcy/wiki/gl31x1
 *
 * ## vue
 * @example
 *```vue
 *  <template>
 *   <div class="landing">
 *     <div @click="backFlow">跳回金管家</div>
 *   </div>
 * </template>
 *```
 *
 * @example
 * ```js
 * import PALandingPageSdk from '@/rpf/un/PALandingPageSdk';
 * import wechatSdk from '@/rpf/un/wechat';
 * import { initFibo } from '@/track/track';
 *
 * const { wx, fiboSDK } = window;
 * // 获取 SDK 实例
 * const SDK = PALandingPageSdk.getInstance();
 *
 * export default {
 *   methods: {
 *     backFlow() {
 *       // 触发跳回金管家
 *       SDK.handleClickBackFlowBtn({
 *         eventId: '',
 *         labelId: '',
 *         fiboBtnId: '',
 *         fiboBtnName: '',
 *         relationalLink: {
 *           actionType: '',
 *           labelid: '',
 *           itemType: '',
 *           itemid: '',
 *           merchantCode: '',
 *           ext: {}
 *         },
 *         noJumpToApg: false
 *       });
 *     }
 *   },
 *   async mounted() {
 *     // SDK 初始化
 *     const data = await SDK.init({
 *       aid: '',
 *       url: `[短链平台配置的短链 + 时间戳]`,
 *       appKey: '引用关系链sdk所需要的appKey值',
 *       env: '引用关系链sdk所用的环境'
 *     }).catch(error => console.log(error));
 *
 *     // 斐波初始化，必须先初始化 fibo
 *     await initFibo({
 *       userInfo: {
 *         openid: data && data.openid ? data.openid : undefined
 *         // 如果vue安装了@babel/plugin-proposal-optional-chaining 推荐使用以下可选链写法
 *         // openid: data?.openid
 *       }
 *     });
 *
 *     // 触发阅读埋点
 *     SDK.handleReadRecord({
 *       relationalLink: {
 *         actionType: '',
 *         labelid: '',
 *         itemType: '',
 *         itemid: '',
 *         merchantCode: '',
 *         ext: {}
 *       },
 *       planB: {
 *         eventId: '',
 *         labelId: '',
 *         fiboBtnId: '',
 *         fiboBtnName: ''
 *       },
 *       offiAccount: {
 *         eventId: '',
 *         labelId: '',
 *         fiboBtnId: '',
 *         fiboBtnName: ''
 *       }
 *     });
 *
 *     // 如果需要埋其他的埋点，例如圈子埋点，可以再根据实际触发埋点
 *     SDK.PALifeOpenH5Track(
 *       {
 *         eventId: '',
 *         labelId: '',
 *         ext: {}
 *       },
 *       'XX圈'
 *     );
 *
 *     // JSAPI 签名
 *     const $wechat = wechatSdk({
 *       jsApi: {
 *         appid: '',
 *         service: ''
 *       }
 *     });
 *     $wechat.config();
 *     // 设置分享话术
 *     const shareParams = {
 *       title: '',
 *       desc: '',
 *       link: SDK.getWxShareUrl(), // 分享链接
 *       imgUrl: ''
 *     };
 *     // 设置分享
 *     wx.ready(() => {
 *       wx.onMenuShareAppMessage({
 *         ...shareParams,
 *         success() {
 *           fiboSDK.share('friend');
 *         }
 *       });
 *       wx.onMenuShareTimeline({
 *         ...shareParams,
 *         success() {
 *           fiboSDK.share('timeline');
 *         }
 *       });
 *     });
 *   }
 * };
 * ```
 *
 * ## react
 *  @example
 *  ```jsx
 * import { useEffect } from 'react';
 * import PALandingPageSdk from 'rpf/un/PALandingPageSdk';
 * import wechatSdk from 'rpf/un/wechat';
 * import { initFibo } from 'track/track';
 *
 * const { wx, fiboSDK } = window;
 * const SDK = PALandingPageSdk.getInstance();
 *
 * const Landing = () => {
 *   useEffect(() => {
 *     async function init() {
 *       // SDK 初始化
 *       const data = await SDK.init({
 *         aid: '',
 *         url: `[短链平台配置的短链 + 时间戳]`,
 *         appKey: '引用关系链sdk所需要的appKey值',
 *         env: '引用关系链sdk所用的环境'
 *       }).catch(error => console.log(error));
 *
 *       // 斐波初始化，必须先初始化 fibo
 *       await initFibo({
 *         userInfo: {
 *           openid: data?.openid
 *         }
 *       });
 *
 *       // 触发阅读埋点
 *       SDK.handleReadRecord({
 *         relationalLink: {
 *           actionType: '',
 *           labelid: '',
 *           itemType: '',
 *           itemid: '',
 *           merchantCode: '',
 *           ext: {}
 *         },
 *         planB: {
 *           eventId: '',
 *           labelId: '',
 *           fiboBtnId: '',
 *           fiboBtnName: ''
 *         },
 *         offiAccount: {
 *           eventId: '',
 *           labelId: '',
 *           fiboBtnId: '',
 *           fiboBtnName: ''
 *         }
 *       });
 *
 *       // 如果需要埋其他的埋点，例如圈子埋点，可以再根据实际触发埋点
 *       SDK.PALifeOpenH5Track(
 *         {
 *           eventId: '',
 *           labelId: '',
 *           ext: {}
 *         },
 *         'XX圈'
 *       );
 *
 *       // JSAPI 签名
 *       const $wechat = wechatSdk({
 *         jsApi: {
 *           appid: '',
 *           service: ''
 *         }
 *       });
 *       $wechat.config();
 *       // 设置分享话术
 *       const shareParams = {
 *         title: '',
 *         desc: '',
 *         link: SDK.getWxShareUrl(), // 分享链接
 *         imgUrl: ''
 *       };
 *       // 设置分享
 *       wx.ready(() => {
 *         wx.onMenuShareAppMessage({
 *           ...shareParams,
 *           success() {
 *             fiboSDK.share('friend');
 *           }
 *         });
 *         wx.onMenuShareTimeline({
 *           ...shareParams,
 *           success() {
 *             fiboSDK.share('timeline');
 *           }
 *         });
 *       });
 *     }
 *     init();
 *   }, []);
 *   return (
 *     <div className="landing">
 *       <div
 *         onClick={() => {
 *           SDK.handleClickBackFlowBtn({
 *             eventId: '',
 *             labelId: '',
 *             fiboBtnId: '',
 *             fiboBtnName: '',
 *             relationalLink: {
 *               actionType: '',
 *               labelid: '',
 *               itemType: '',
 *               itemid: '',
 *               merchantCode: '',
 *               ext: {}
 *             },
 *             noJumpToApg: false
 *           });
 *         }}
 *       >
 *         跳回金管家
 *       </div>
 *     </div>
 *   );
 * };
 *
 * export default Landing;
 * ```
 *
 * @param {string} aid xxx
 */
class PALandingPageSdk {
  constructor() {
    this.isInit = false; // sdk 是否初始化过
  }

  /** 获取 SDK 实例
   * @returns {PALandingPageSdk:object} PALandingPageSdk : SDK 实例
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new PALandingPageSdk();
    }
    return this.instance;
  }

  /**
   * 初始化 SDK，包括初始化金管家外部埋点、金管家微信授权和初始化关系链埋点
   * @param {object} options
   * @param {string} options.aid 必填，活动号
   * @param {string} options.url 必填，项目地址，eg:`http://apg-sunshine-contest.j.h5no1.cn/abcd/857857`, 短链平台配置的短链 + 时间戳;
   * @param {string} options.channelKey 选填, 默认值为 `channel`；埋点时会将当前地址上的, 查询参数（channelKey）作为扩展字段；如果需要触发公众号渠道埋点，请确保当前地址上带有该查询参数
   * @param {string} options.appKey 必填，关系链 sdk 地址所用到的 appKey 值，因为不同环境和不同项目的 appKey 值不一样，需要找项目经理拿项目所用的 appKey
   * @param {string} options.env 选填，默认值为 prod 环境。关系链 sdk 地址所用的环境，prod 为正式环境，test 为测试环境
   * @returns {{openid: string; openToken: string}}  openid: 金管家微信授权返回的 openid，openToken: 金管家微信授权返回的 openToken
   */
  async init({ aid, url, channelKey, appKey, env = 'prod' } = {}) {
    if (isPARS()) {
      return Promise.reject(
        Error('请不要在金管家环境里面使用关系链埋点sdk，会导致报错')
      );
    }

    if (!window.PALifeOpenH5) {
      return Promise.reject(Error('缺少PALifeOpenH5 SDK的引用'));
    }

    if (!this.isInit) {
      if (!window.PARelationalLink) {
        if (!appKey) {
          return Promise.reject(
            Error(
              '缺少PARelationalLink SDK的引用，初始化的时候请带上关系链埋点sdk所用到的appKey'
            )
          );
        }
        // 引入相应环境关系链埋点sdk
        await getPARelationalLinkSDK({ appKey, env });
      }
      try {
        validateStr('getInstance aid', aid, true);
        validateStr('getInstance url', url, true);
        validateStr('getInstance channelKey', channelKey);
      } catch (error) {
        return Promise.reject(Error(error));
      }
      console.log('内部统一方法：PALandingPageSdk 落地页sdk');
      this.query = qs.parse(window.location.search.slice(1)); // 当前链接上的参数
      this.channelKey = channelKey || 'channel'; // 渠道参数的 key
      this.aid = aid; // 活动号
      this.url = url;

      let wxAuthData = {}; // 金管家微信授权获取的用户信息
      try {
        // PALifeOpenH5 初始化
        PALifeOpenH5.config();
        // ⾦管家微信授权
        wxAuthData = PALifeOpenH5.wxAuthInit();
      } catch (error) {
        return Promise.reject(
          Error('PALifeOpenH5 wxAuthInit⾦管家微信授权报错:', error)
        );
      }
      const { openid, openToken } = wxAuthData;
      if (!openid && !openToken) {
        return Promise.reject(Error('未获取到⾦管家微信授权数据'));
      }

      // 关系链初始化
      try {
        PARelationalLink.init({
          openid,
          unionid: '',
          phone: ''
        });
      } catch (error) {
        return Promise.reject(Error('PARelationalLink init Error:', error));
      }

      // 处理传入的链接
      this.url = megerSearchToUrl(this.url, this.query, this.channelKey);

      // 生成回流链接
      this.backflowLink = createBackflowLink(this.url, this.aid, { env });

      this.isInit = true;
      return Promise.resolve({ openid, openToken });
    }
    return Promise.reject(Error('内部统一方法：PALandingPageSdk 已初始化过'));
  }

  /**
   * 封装关系链埋点方法
   * @param {object} props 必填, 关系链埋点
   * @param {string} props.actionType 必填，根据产品要求填写
   * @param {string} props.labelid  必填，根据产品要求填写
   * @param {string} props.itemType 必填，当前触发区域归属的类型 根据产品要求填写
   * @param {string} props.itemid 必填，当前触发区域归属的 ID，根据产品要求填写
   * @param {string} props.merchantCode  必填，商户号，根据产品要求填写
   * @param {{Record<string, string | number>}}  props.ext 选填，根据产品要求填写
   * @param {string} from 选填，用于 console.log 的标志
   */
  PARelationalLinkTrack(props = {}, from = '') {
    handleNotInit(this.isInit);
    const { actionType, labelid, itemType, itemid, merchantCode, ext } = props;
    validateStr(`${from} actionType`, actionType, true);
    validateStr(`${from} labelid`, labelid, true);
    validateStr(`${from} itemType`, itemid, true);
    validateStr(`${from} actionType`, actionType, true);
    validateStr(`${from} merchantCode`, merchantCode, true);
    try {
      PARelationalLink.action(
        actionType,
        labelid,
        itemType,
        itemid,
        merchantCode,
        ext
      );
      console.log(`关系链埋点-${from}:`, props);
    } catch (error) {
      console.error(`关系链埋点-${from} 失败！`, error);
    }
  }

  /**
   * 封装金管家外部埋点方法
   * @param {object} props 必填, 金管家外部埋点
   * @param {string} props.eventId 必填，金管家外部埋点参数
   * @param {string} props.labelId  必填，金管家外部埋点参数
   * @param {Record<string, string | number>} props.ext 选填，根据产品要求填写
   * @param {string} from 选填，用于 console.log 的标志
   */
  PALifeOpenH5Track({ eventId, labelId, ext } = {}, from = '') {
    handleNotInit(this.isInit);
    validateStr(`${from} eventId`, eventId, true);
    validateStr(`${from} labelId`, labelId, true);
    handlePaTrackValue(PALifeOpenH5.addRecord(eventId, labelId, ext), from);
  }

  /**
   * 封装斐波点击事件埋点方法
   * @param {object} props 必填, 斐波埋点
   * @param {string} props.fiboBtnId 必填，斐波埋点参数
   * @param {string} props.fiboBtnName  必填，斐波埋点参数
   * @param {string} from 选填，用于 console.log 的标志
   */
  fiboSDKTrack({ fiboBtnId, fiboBtnName } = {}, from = '') {
    if (!fiboSDK) {
      throw Error(`PALandingPageSdk can't find fiboSDK`);
    }
    handleNotInit(this.isInit);
    validateStr(`${from} fiboBtnId`, fiboBtnId, true);
    validateStr(`${from} fiboBtnName`, fiboBtnName, true);
    try {
      fiboSDK.btnClick(fiboBtnId, fiboBtnName);
      console.log(`斐波埋点-${from}:`, { fiboBtnId, fiboBtnName });
    } catch (error) {
      console.error(`斐波埋点-${from} 失败！`, error);
    }
  }

  /**
   * 处理阅读埋点，默认会处里金管家外部阅读埋点，可传入兜底埋点、关系链埋点、公众号渠道埋点的参数，统一一起处理；如果需要触发公众号渠道埋点，请确保当前地址上带有该查询参数；
   * @param {object} object
   * @param {object} object.planB  选填，埋点兜底阅读埋点
   * @param {string} object.planB.eventId 必填，金管家外部埋点参数
   * @param {string} object.planB.labelId  必填，金管家外部埋点参数
   * @param {string} object.planB.fiboBtnId 必填，斐波埋点参数
   * @param {string} object.planB.fiboBtnName 必填，斐波埋点参数
   * @param {object} object.offiAccount  选填，公众号渠道埋点
   * @param {string} object.offiAccount.eventId 必填，金管家外部埋点参数
   * @param {string} object.offiAccount.labelId  必填，金管家外部埋点参数
   * @param {string} object.offiAccount.fiboBtnId 必填，斐波埋点参数
   * @param {string} object.offiAccount.fiboBtnName 必填，斐波埋点参数
   * @param {object} object.relationalLink  选填，关系链埋点
   * @param {string} object.relationalLink.actionType  必填，根据产品要求填写
   * @param {string} object.relationalLink.labelid  必填，根据产品要求填写
   * @param {string} object.relationalLink.itemType 必填，当前触发区域归属的类型 根据产品要求填写
   * @param {string} object.relationalLink.itemid 必填，当前触发区域归属的 ID，根据产品要求填写
   * @param {string} object.relationalLink.merchantCode 必填，商户号，根据产品要求填写
   * @param {Record<string, string | number>} object.relationalLink.ext 选填，根据产品要求填写
   */
  handleReadRecord({ planB, relationalLink, offiAccount } = {}) {
    const name = '阅读埋点';
    handleNotInit(this.isInit);
    const ext = {
      act_action: 'read',
      channel: this.query[this.channelKey]
    };
    // 公众号渠道埋点
    if (this.query[this.channelKey] && offiAccount) {
      this.PALifeOpenH5Track({ ...offiAccount, ext }, `公众号渠道${name}`);
      this.fiboSDKTrack(offiAccount, `公众号渠道${name}`);
    }
    // 用点击埋点来兜底阅读埋点
    if (planB) {
      this.PALifeOpenH5Track({ ...planB, ext }, `兜底${name}`);
      this.fiboSDKTrack(planB, `兜底${name}`);
    }
    // 关系链阅读埋点
    if (relationalLink) {
      this.PARelationalLinkTrack(relationalLink, name);
    }
    // 金管家外部阅读埋点
    handlePaTrackValue(PALifeOpenH5.addReadRecord(this.aid, ext), name);
  }

  /**
   * 处理点击按钮跳转回到金管家，包括点击事件埋点的触发、对回流链接的处理和写入金管家要求的链接到粘贴板；
   * @param {object} object
   * @param {string} object.eventId 必填，金管家外部埋点参数
   * @param {string} object.labelId  必填，金管家外部埋点参数
   * @param {string} object.fiboBtnId 必填，斐波埋点参数
   * @param {string} object.fiboBtnName 必填，斐波埋点参数
   * @param {object} object.relationalLink  必填，关系链埋点
   * @param {string} object.relationalLink.actionType 必填，根据产品要求填写
   * @param {string} object.relationalLink.labelid  必填，根据产品要求填写
   * @param {string} object.relationalLink.itemType 必填，当前触发区域归属的类型 根据产品要求填写
   * @param {string} object.relationalLink.itemid 必填，当前触发区域归属的 ID，根据产品要求填写
   * @param {string} object.relationalLink.merchantCode 必填，商户号，根据产品要求填写
   * @param {Record<string, string | number>} object.relationalLink.ext 选填，根据产品要求填写
   * @param {boolean} object.noJumpToApg 选填，默认值为false； 是否触发跳转到金管家，用于测试；
   */
  handleClickBackFlowBtn({
    eventId,
    labelId,
    fiboBtnId,
    fiboBtnName,
    relationalLink,
    noJumpToApg = false
  } = {}) {
    const name = '点击回流按钮';
    handleNotInit(this.isInit);
    // 埋点
    this.PALifeOpenH5Track({ eventId, labelId }, name);
    this.fiboSDKTrack({ fiboBtnId, fiboBtnName }, name);
    this.PARelationalLinkTrack(relationalLink, `${name} relationalLink`);

    // 延时 200ms 跳回金管家，以防埋点未上报完
    setTimeout(() => {
      const [path, parsUrl] = this.backflowLink.split('?url=');
      const parsResolve = PARelationalLink.parsResolve(
        decodeURIComponent(parsUrl)
      );
      const url = `${path}?url=${encodeURIComponent(parsResolve)}`;
      if (noJumpToApg) {
        console.error(`apg外部埋点测试模式，不跳回金管家; 跳转url:${url}`);
      } else {
        window.location.replace(url);
      }
    }, 200);
  }

  /**
   * 获取已经处理好（PARelationalLink.shareUrl 和 fiboSDK.dealUrl）的微信二次分享链接
   * @returns {url:string} 微信二次分享链接
   */
  getWxShareUrl() {
    handleNotInit(this.isInit);
    return PARelationalLink.shareUrl(
      fiboSDK ? fiboSDK.dealUrl(this.url) : this.url
    );
  }
}

export default PALandingPageSdk;
