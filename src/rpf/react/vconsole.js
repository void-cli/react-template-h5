/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import 'core-js/features/symbol';
import VConsole from 'vconsole';
import vconsoleReloadPlugin from '../un/vconsoleReloadPlugin';
import vconsoleFilterNetworkPlugin, {
  getFilterList
} from '../un/vconsoleFilterNetwork';
import vconsoleBackdoor from '../un/vconsoleBackdoor';
import vconsoleProxyPlugin, { getProxyObj } from '../un/vconsoleProxyPlugin';
import vconsoleNetwork from '../un/vconsoleNetworkPlugin';

if (!/localhost/.test(window.location.origin)) {
  if (process.env.REACT_APP_VCONSOLE === 'false') {
    vconsoleBackdoor();
  }

  /* add `html { height: 100% }` if not working */
  localStorage.setItem('vConsole_switch_y', `${window.innerHeight / 2}`);

  try {
    const vc = new VConsole();

    vc.addPlugin(vconsoleReloadPlugin(VConsole));
    vconsoleNetwork(vc, getFilterList(), getProxyObj());
    vc.addPlugin(vconsoleProxyPlugin(VConsole));
    vc.addPlugin(vconsoleFilterNetworkPlugin(VConsole, getFilterList()));

    // 去除network的滚动事件，解决ios发请求后界面滚动到底部
    const { scrollToBottom } = vc.pluginList.network;
    vc.pluginList.network.scrollToBottom = () => {
      const { isShow } = vc.pluginList.network;
      if (isShow) scrollToBottom();
    };
  } catch (err) {
    // eslint-disable-next-line no-alert
    alert(`VCONSOLE ERROR:${err.message}`);
  }

  window.addEventListener('unhandledrejection', event => {
    console.error('Promise 没有 catch ！！！', event.reason);
  });
}

/**
 *
 * - 带有刷新插件
 * - 配合 `REACT_APP_VCONSOLE` 环境变量启用后门，先隐藏，快速点击屏幕右下角 10 下后显示
 * - 在 `localhost` 域名下不进行初始化
 * - 改善了一些 vconsole 的缺陷
 *
 * 需要安装 `vconsole` 依赖
 *
 * ```bash
 * npm i -S vconsole
 * ```
 *
 * **示例**
 *
 * 在入口文件尽早引入，polyfill 之后，业务逻辑之前
 *
 * ```js
 * // import polyfills before
 * import './rpf/vue/vconsole';
 * import App from './App';
 * ```
 *
 * 在 `package.json` 添加
 *
 * ```json
 * {
 *   "scripts": {
 *     "build-prod": "cross-env REACT_APP_VCONSOLE=false react-scripts build"
 *   }
 * }
 * ```
 *
 * 进行生产环境构建时运行 `npm run build-prod` 就可以启用后门
 *
 */
export const vconsole = null;
