import { asFunction, asString } from './verify-type';

/* eslint-disable import/extensions */
function noop(name) {
  console.info('FAKE Sentry', name);
}

/**
 * @HELP
 * iOS 9.x.x will still receive this error
 * undefined is not an object (evaluating 'window.pageView.pageViewId')
 */

const ignoreErrors = [
  'Aplus4UT is not defined',
  'bonreeJsBridge.',
  'ignoreError is not defined',
  'Java exception was raised during method invocation',
  'Java object is gone',
  'java_obj.onJsError',
  'nativeJs.checkEncode',
  'nativeJs.onException',
  'ToutiaoJSBridge is not defined',
  'vivo_checkMediaPausedReason is not defined',
  'vivoNewsDetailPage.getNewsReadStatus4Vivo',
  'window.androidJsBridgeKit.responseNative',
  'x5onSkinSwitch is not defined',
  "'pageViewId' of undefined",
  "Cannot read property 'execWebFn' of undefined",
  "evaluating 'window.pageView.pageViewId'",
  "has no method 'onJsError'",
  "Identifier 'qbSniffJsVersion'"
];

function getIsIgnoreError(message) {
  let isIgnoreError = false;
  for (let i = 0; i < ignoreErrors.length; i++) {
    const str = ignoreErrors[i];
    if (message.indexOf(str) > -1) {
      isIgnoreError = true;
      break;
    }
  }
  return isIgnoreError;
}

/**
 * @typedef {import('@sentry/browser')} Sentry
 * @typedef {import('@sentry/browser').Event} Event
 * @typedef {import('@sentry/browser').EventHint} EventHint
 */

/**
 * 加载 sentry
 *
 * 在生产环境 `(NODE_ENV === 'production')` 中加载 Sentry 库，并将 Sentry 加入全局变量，并过滤掉 webview 常见的未知错误
 *
 * 在其他环境中，将一个假的 Sentry 加入到全局变量
 *
 * ```js
 * window.Sentry = {
 *   FAKE_SDK: true,
 *   captureEvent: () => {},
 *   captureException: () => {},
 *   captureMessage: () => {}
 *   // ...
 * };
 * ```
 *
 * 加入假的 Sentry 是为了编写自定义捕获代码时不需要检查 `window.Sentry` 是否存在
 *
 * ```js
 * try {
 *   // ...
 * } catch (err) {
 *   // window.Sentry && window.Sentry.captureException(err); 再也不需要这么写了
 *   window.Sentry.captureException(err);
 * }
 * ```
 *
 * @example
 * ```js
 * import loadSentry from './rpf/un/loadSentry';
 *
 * loadSentry('__your_dsn_string__').then(() => {
 *   // render my app
 * });
 * ```
 *
 * @param {string} dsn 字符串，必填
 * @param {(event: Event, hint: EventHint) => void} userBeforeSend 请参考 https://docs.sentry.io/error-reporting/configuration/?platform=browsernpm#before-send
 * @param {boolean} autoAdjustError 在调用 `Sentry.captureException` 传入非 Error 对象时，自动调整 `Custom Object` 的错误信息，默认 true
 * @returns {Promise<Sentry>}
 */
export default function loadSentry(
  dsn,
  userBeforeSend,
  autoAdjustError = true
) {
  asString(dsn || null, 'dsn is required and should be string');
  if (userBeforeSend) {
    asFunction(userBeforeSend, 'beforeSend should be function');
  }

  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line import/no-extraneous-dependencies
      import(/* webpackChunkName: "sentry" */ '@sentry/browser/dist/index.js')
        .then(Sentry => {
          Sentry.init({
            dsn,
            beforeSend: (event, hint) => {
              const error = hint.originalException;
              if (
                autoAdjustError &&
                event.level === 'error' &&
                !(error instanceof Error) &&
                typeof error === 'object'
              ) {
                event.exception.values = event.exception.values.map(item => {
                  // put in try in case of circular structure
                  try {
                    return item.value === 'Custom Object'
                      ? { ...item, value: JSON.stringify(error) }
                      : item;
                  } catch (e) {
                    return item;
                  }
                });
              }
              if (error && error.message && getIsIgnoreError(error.message)) {
                return null;
              }
              if (userBeforeSend) {
                return userBeforeSend(event, hint);
              }
              return event;
            }
          });
          window.Sentry = Sentry;
          resolve(Sentry);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      window.Sentry = {
        FAKE_SDK: true,
        BrowserClient: noop.bind(null, 'BrowserClient'),
        Hub: noop.bind(null, 'Hub'),
        Integrations: {},
        SDK_NAME: 'FAKE_SDK_NAME',
        SDK_VERSION: 'FAKE_SDK_VERSION',
        Scope: noop.bind(null, 'Scope'),
        Severity: {},
        Status: {},
        Transports: {},
        addBreadcrumb: noop.bind(null, 'addBreadcrumb'),
        addGlobalEventProcessor: noop.bind(null, 'addGlobalEventProcessor'),
        captureEvent: noop.bind(null, 'captureEvent'),
        captureException: noop.bind(null, 'captureException'),
        captureMessage: noop.bind(null, 'captureMessage'),
        close: noop.bind(null, 'close'),
        configureScope: noop.bind(null, 'configureScope'),
        defaultIntegrations: {},
        flush: noop.bind(null, 'flush'),
        forceLoad: noop.bind(null, 'forceLoad'),
        getCurrentHub: noop.bind(null, 'getCurrentHub'),
        getHubFromCarrier: noop.bind(null, 'getHubFromCarrier'),
        init: noop.bind(null, 'init'),
        lastEventId: noop.bind(null, 'lastEventId'),
        onLoad: noop.bind(null, 'onLoad'),
        setContext: noop.bind(null, 'setContext'),
        setExtra: noop.bind(null, 'setExtra'),
        setExtras: noop.bind(null, 'setExtras'),
        setTag: noop.bind(null, 'setTag'),
        setTags: noop.bind(null, 'setTags'),
        setUser: noop.bind(null, 'setUser'),
        showReportDialog: noop.bind(null, 'showReportDialog'),
        withScope: noop.bind(null, 'withScope'),
        wrap: noop.bind(null, 'wrap')
      };
      resolve(false);
    }
  });
}
