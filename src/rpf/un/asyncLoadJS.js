/**
 * 动态加载 js 脚本
 *
 * @example
 * ```js
 * asyncLoadJs('https://a_js_script_to_load.js')
 * .then(() => console.log('load success'))
 * .catch(() => console.error('load fail'));
 * ```
 *
 * @param {string} src 脚本链接
 * @param {string} type 脚本类型，默认为 'text/javascript'
 * @returns {Promise<HTMLScriptElement>} 脚本加载成功或失败后返回
 */
export default function asyncLoadJS(src, type = 'text/javascript') {
  /** @type {HTMLScriptElement} */
  let script = document.querySelector(`script[src="${src}"]`);

  // BUG: 能获取到 script 标签也不一定代表加载成功
  if (script) {
    return Promise.resolve(script);
  }

  return new Promise((resolve, reject) => {
    script = document.createElement('script');
    script.type = type;

    function load() {
      resolve(script);
      script.removeEventListener('error', error);
    }
    function error(err) {
      reject(err);
      script.removeEventListener('load', load);
    }

    script.addEventListener('load', load, { once: true });
    script.addEventListener('error', error, { once: true });

    script.src = src;
    document.body.appendChild(script);
  });
}
