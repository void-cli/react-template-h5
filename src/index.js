import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './rpf/react/vconsole';

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import loadSentry from 'rpf/un/loadSentry';
import preventScroll from 'rpf/un/preventScroll';
preventScroll();

if (!window.$TZ_CONFIG.ok) {
  // 错误处理
  // alert('配置加载失败');
}

// 初始化 Sentry
loadSentry(window?.$TZ_CONFIG?.conf?.sentry?.dsn).then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
