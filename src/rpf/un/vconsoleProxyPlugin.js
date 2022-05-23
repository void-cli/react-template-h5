/* eslint-disable no-unused-vars */
import fixIOSForm from './fixIOSForm';

fixIOSForm();

const domainInputId = '__vc_proxy_domain_url';
const targetInputId = '__vc_proxy_target_url';
const addBtnId = '__vc_proxy_add_btn';
const proxyListId = '__vc_proxy_list';
const listBtnClassName = 'vc-proxy-btn';
const urlErrId = '__vc_proxy_err';

const PROXY_LIST_KEY = 'PROXY_LIST_KEY'; // 列表在localstorage的key

// 编辑icon
const editIcon = `
  <div class="svelte-dhd3ex"><svg id="" class="" style="height:1em;vertical-align:-.125em;overflow:visible;" viewBox="0 0 576 512" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg"><g transform="translate(256 256)"><g transform=""><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" fill="currentColor" transform="translate(-256 -256)"></path></g></g></svg></div>
`;

// 保存icon
const keeyIcon = `
  <div class="svelte-dhd3ex"><svg id="" class="" style="height:1em;vertical-align:-.125em;overflow:visible;" viewBox="0 0 448 512" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg"><g transform="translate(256 256)"><g transform=""><path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z" fill="currentColor" transform="translate(-256 -256)"></path></g></g></svg></div>
`;

// 删除icon
const delIcon = `
  <div class="svelte-dhd3ex" style="user-select: none;pointer-events: none;"><svg id="" class="" style="height:1em;vertical-align:-.125em;overflow:visible;" viewBox="0 0 448 512" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg"><g transform="translate(256 256)"><g transform=""><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z" fill="currentColor" transform="translate(-256 -256)"></path></g></g></svg></div>
`;

/**
 * 获取接口代理对象
 *
 * @returns {object}
 */
export function getProxyObj() {
  return JSON.parse(window.localStorage.getItem(PROXY_LIST_KEY)) || {};
}

function injectCSS(text = '') {
  const $style = document.createElement('style');
  $style.type = 'text/css';
  $style.textContent = `\n${text.trim()}\n`;
  document.head.appendChild($style);
}

function createEl(domainUrl = '', targetUrl = '') {
  if (!domainUrl || !targetUrl) {
    const $urlErr = document.getElementById(urlErrId);
    $urlErr.style.opacity = '1';

    setTimeout(() => {
      $urlErr.style.opacity = '0';
    }, 2000);

    return null;
  }

  const $prosyList = document.getElementById(proxyListId);
  const html = `
    <div class="vc-proxy-content">
      <div class="vc-proxy-domain">${domainUrl}</div>
      <div class="vc-proxy-target">${targetUrl}</div>
      <div class="${listBtnClassName}">${delIcon}</div>
    </div>
  `;
  $prosyList.insertAdjacentHTML('beforeEnd', html);

  return { domainUrl, targetUrl };
}

/**
 *
 * vconsole 插件，接口代理
 *
 * @example
 * ```js
 * import VConsole from 'vconsole';
 * import vconsoleProxyPlugin from '../un/vconsoleProxyPlugin';
 *
 * const vc = new VConsole();
 * vc.addPlugin(vconsoleProxyPlugin(VConsole));
 * ```
 *
 * @param {object} VConsole VConsole 对象
 * @returns {object} VConsolePlugin
 *
 */
function vconsoleProxyPlugin(VConsole) {
  const proxyPlugin = new VConsole.VConsolePlugin('proxy', 'Proxy');

  injectCSS(`
    #__vconsole .vc-tabbar {
      overflow-y: hidden;
    }
    #__vconsole .vc-proxy-addr {
      padding: 0.5em;
    }
    #__vconsole .vc-proxy-url {
      box-sizing: border-box;
      display: block;
      width: 100%;
      border: 1px solid #d9d9d9;
      border-radius: 5px;
      margin-bottom: .5em;
      font-size: 14px;
    }
    #__vconsole .vc-proxy-go-btn {
      box-sizing: border-box;
      display: block;
      width: 50%;
      height: 3em;
      padding: 0;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #eee;
      margin: auto;
      font-size: 14px;
      margin-bottom: 1em;
    }
    #__vconsole .vc-proxy-go-btn:active {
      background-color: #ddd;
    }
    #__vconsole .vc-proxy-size {
      padding: 0.5em;
      margin-top: 1em;
    }

    #__vconsole .vc-proxy-title,
    #__vconsole .vc-proxy-content{
      display:flex;
      box-sizing: inherit;
    }
    #__vconsole .vc-proxy-domain{
      flex:4;
      text-align:center;
      line-height:1.2rem;
      border: 1px solid #eee;
    }
    #__vconsole .vc-proxy-target{
      flex:4;
      text-align:center;
      line-height:1.2rem;
      border: 1px solid #eee;
    }
    #__vconsole .vc-proxy-title .vc-proxy-domain,
    #__vconsole .vc-proxy-title .vc-proxy-target{
      line-height:2rem;
    }
    #__vconsole .${listBtnClassName}{
      flex:1.5;
      border: 1px solid #eee;
      display:flex;
      justify-content: center;
      align-items:center;
    }

    #__vconsole .vc-proxy-err{
      position:fixed;
      top:50%;
      left:50%;
      transform: translate3d(-50%, -50%, 0);
      transition: all .3s linear;
      text-align: center;
      background-color: rgba(0,0,0,0.7);
      border-radius: 1rem;
      padding: .5rem 1rem;
      color:#fff;
    }
  `);

  proxyPlugin.on('renderTab', callback => {
    const html = `
    <div>
      <div class="vc-proxy-addr">原始域名：</div>
      <textarea rows="2" class="vc-proxy-url" id="${domainInputId}"></textarea>
      <div class="vc-proxy-addr">代理域名</div>
      <textarea rows="2" class="vc-proxy-url" id="${targetInputId}"></textarea>
      <button type="button" class="vc-proxy-go-btn" id="${addBtnId}">添加</button>
      <div class="vc-proxy-title">
        <div class="vc-proxy-domain">原始域名</div>
        <div class="vc-proxy-target">代理域名</div>
        <div class="${listBtnClassName}"></div>
      </div>
      <div id="${proxyListId}" class="vc-proxy-list"></div>
    </div>
    <div id="${urlErrId}" class="vc-proxy-err" style="opacity:0">
      域名识别失败<br>请做好域名的分隔
    </div>
    `;
    callback(html);
  });
  proxyPlugin.on('ready', () => {
    const $domainInputId = document.getElementById(domainInputId);
    const $targetInputId = document.getElementById(targetInputId);
    const $addBtn = document.getElementById(addBtnId);
    const $prosyList = document.getElementById(proxyListId);

    $domainInputId.value = '';
    $targetInputId.value = '';

    $addBtn.addEventListener(
      'click',
      () => {
        const data = createEl($domainInputId.value, $targetInputId.value);
        if (data) {
          const { domainUrl, targetUrl } = data;

          const newRule = {};
          newRule[domainUrl] = targetUrl;

          const proxyObj = getProxyObj();

          window.localStorage.setItem(
            PROXY_LIST_KEY,
            JSON.stringify({ ...proxyObj, ...newRule })
          );

          const timer = setTimeout(() => {
            window.location.reload();
            clearTimeout(timer);
          }, 0);
        }
        $domainInputId.value = '';
        $targetInputId.value = '';
      },
      false
    );
    $domainInputId.addEventListener(
      'touchmove',
      e => {
        e.stopPropagation();
      },
      false
    );
    $targetInputId.addEventListener(
      'touchmove',
      e => {
        e.stopPropagation();
      },
      false
    );
    $prosyList.addEventListener(
      'click',
      e => {
        const { target } = e;
        if (target.className === listBtnClassName) {
          const proxyObj = JSON.parse(
            window.localStorage.getItem(PROXY_LIST_KEY)
          );
          const key = target.parentNode.children[0].innerText;
          if (key) {
            delete proxyObj[key];
            target.parentNode.remove();
            window.localStorage.setItem(
              PROXY_LIST_KEY,
              JSON.stringify({ ...proxyObj })
            );

            const timer = setTimeout(() => {
              window.location.reload();
              clearTimeout(timer);
            }, 0);
          }
        }
      },
      false
    );

    const proxyObj = getProxyObj();
    Object.keys(proxyObj).map(key => {
      const val = proxyObj[key];
      createEl(key, val);
      return key;
    });
  });
  proxyPlugin.on('show', () => {});
  proxyPlugin.on('addTool', callback => {
    callback([
      {
        name: '清空',
        onClick: () => {
          window.localStorage.removeItem(PROXY_LIST_KEY);

          const timer = setTimeout(() => {
            window.location.reload();
            clearTimeout(timer);
          }, 0);
        }
      }
    ]);
  });

  return proxyPlugin;
}

export default vconsoleProxyPlugin;
