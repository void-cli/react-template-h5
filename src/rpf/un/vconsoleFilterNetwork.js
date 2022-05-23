/* eslint-disable no-shadow */
/* eslint-disable no-continue */
/* eslint-disable prefer-rest-params */
/* eslint-disable func-names */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import fixIOSForm from './fixIOSForm';

fixIOSForm();

const LOCALSTORA_GENAME = 'vconsoleFilterNetworkUrls';
const DEFAULT_FILTER_LIST = [
  {
    url: 'http://www.baidu.com',
    disable: false
  },
  {
    url: 'https://sdkapi.fibodata.com/track',
    disable: false
  },
  {
    url: 'https://elis-smp-ubas-new.lifeapp.pingan.com.cn:433/smp-ubas-dmz/mobile/savePerformanceInfoForH5.do',
    disable: false
  },
  {
    url: 'https://test-elis-smp-ubas-new.lifeapp.pingan.com.cn:11143/smp-ubas-dmz/mobile/savePerformanceInfoForH5.do',
    disable: false
  }
];

/**
 * 获取过滤列表
 *
 * @returns {string[]}
 */
export function getFilterList() {
  let filterList = JSON.parse(window.localStorage.getItem(LOCALSTORA_GENAME));
  if (!filterList) {
    window.localStorage.setItem(
      LOCALSTORA_GENAME,
      JSON.stringify(DEFAULT_FILTER_LIST)
    );
    filterList = DEFAULT_FILTER_LIST;
  }
  return filterList;
}

/**
 *
 * vconsole 插件，过滤网络请求
 *
 * @example
 * ```js
 * import VConsole from 'vconsole';
 * import vconsoleFilterNetworkPlugin, {
 *   getFilterList
 * } from '../un/vconsoleFilterNetwork';
 *
 * const vc = new VConsole();
 * vc.addPlugin(vconsoleFilterNetworkPlugin(VConsole, getFilterList()));
 * ```
 *
 * @param {object} VConsole  VConsole对象
 * @param {string[]} filterList 过滤列表
 *
 * @returns {object} VConsolePlugin
 */
function vconsoleFilterNetworkPlugin(VConsole, filterList) {
  const inputId = '__vc-filter-url_url';
  const addBtnId = '__vc-filter-url_add_btn';
  const sizeId = '__vc-filter-url_size';
  const reloadId = '__vc-filter-url_reload_btn';
  const restoreId = '__vc-filter-url_restore_btn';

  const reloadPlugin = new VConsole.VConsolePlugin(
    'filterNetworkUrls',
    'FilterNetworkUrls'
  );

  function injectCSS(text = '') {
    const $style = document.createElement('style');
    $style.type = 'text/css';
    $style.textContent = `\n${text.trim()}\n`;
    document.head.appendChild($style);
  }

  injectCSS(`
    #__vconsole .vc-tabbar {
      overflow-y: hidden;
    }
    #__vconsole .vc-filter-url-addr {
      padding: 0.5em;
    }
    #__vconsole .vc-filter-url-url {
      box-sizing: border-box;
      display: block;
      width: 100%;
      border: 1px solid #d9d9d9;
      border-radius: 5px;
      margin-bottom: 1em;
      font-size: 14px;
    }
    #__vconsole .vc-filter-url-go-btn {
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
    }
    #__vconsole .vc-filter-url-go-btn:active {
      background-color: #ddd;
    }
    #__vconsole .vc-filter-url-size {
      padding: 0.5em;
      margin-top: 1em;
    }
  `);

  reloadPlugin.on('renderTab', callback => {
    const html = `
    <div>
      <textarea rows="6" class="vc-filter-url-url" id="${inputId}"></textarea>
      <button type="button" class="vc-filter-url-go-btn" id="${addBtnId}">添加要过滤的url</button>
      <div class="vc-filter-url-size" id="${sizeId}"></div>
    </div>
    <div style='margin:10px'>
      <form id='filterUrls'>
      ${filterList.reduce(
        (n, r) =>
          `<input style='display:block' name="Fruit" type='checkbox' ${
            r.disable ? 'checked' : ''
          } value="${r.url}" />${r.url}${n}`,
        ''
      )}
      </form>
     <button type="button" style='margin:50px auto' class="vc-filter-url-take-effect vc-filter-url-go-btn" id="${reloadId}">勾选后点确定生效</button>
     <button type="button" style='margin:50px auto' class="vc-filter-url-restore vc-filter-url-go-btn" id="${restoreId}">还原过滤netWork的数据</button>
    </div>
    `;
    callback(html);
  });

  reloadPlugin.on('ready', () => {
    const $reLoad = document.getElementById(reloadId);
    const $input = document.getElementById(inputId);
    const $addBtn = document.getElementById(addBtnId);
    const $restore = document.getElementById(restoreId);

    $reLoad.addEventListener(
      'click',
      () => {
        const filtersData = JSON.parse(
          window.localStorage.getItem(LOCALSTORA_GENAME)
        );
        const checkboxs = document.getElementById('filterUrls').children;
        const checkedUrls = Array.prototype.filter
          .bind(checkboxs)(item => item.checked)
          .map(item => item.value);
        filtersData.forEach(element => {
          element.disable = checkedUrls.includes(element.url);
        });
        window.localStorage.setItem(
          LOCALSTORA_GENAME,
          JSON.stringify(filtersData)
        );
        window.location.reload();
      },
      false
    );
    $addBtn.addEventListener(
      'click',
      () => {
        if (!$input.value) return;
        const filtersData = JSON.parse(
          window.localStorage.getItem(LOCALSTORA_GENAME)
        );
        filtersData.push({
          url: $input.value,
          disable: true
        });
        window.localStorage.setItem(
          LOCALSTORA_GENAME,
          JSON.stringify(filtersData)
        );
        const timer = setTimeout(() => {
          window.location.reload();
          clearTimeout(timer);
        }, 0);
      },
      false
    );
    $input.addEventListener(
      'touchmove',
      e => {
        e.stopPropagation();
      },
      false
    );
    $restore.addEventListener(
      'click',
      () => {
        window.localStorage.removeItem(LOCALSTORA_GENAME);
        const timer = setTimeout(() => {
          window.location.reload();
          clearTimeout(timer);
        }, 0);
      },
      false
    );
  });

  return reloadPlugin;
}

export default vconsoleFilterNetworkPlugin;
