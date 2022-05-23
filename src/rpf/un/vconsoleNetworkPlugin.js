/* eslint-disable no-eval */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-cond-assign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable eqeqeq */
/* eslint-disable no-useless-escape */
import { VConsoleNetworkPlugin } from 'vconsole';

/**
 * vconsole库里面的方法
 */
const tool = {
  /**
   * vconsole库里面的方法
   */

  /**
   * get formatted date by timestamp
   * @param  int    time
   * @return  object
   */
  getDate(time) {
    const d = time > 0 ? new Date(time) : new Date();
    const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
    const month = d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
    const year = d.getFullYear();
    const hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
    const minute = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
    const second = d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds();
    let millisecond =
      d.getMilliseconds() < 10
        ? `0${d.getMilliseconds()}`
        : d.getMilliseconds();
    if (millisecond < 100) {
      millisecond = `0${millisecond}`;
    }
    return {
      time: +d,
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    };
  },

  /**
   * determines whether the passed value is a specific type
   * @param mixed value
   * @return boolean
   */
  isNumber(value) {
    return Object.prototype.toString.call(value) == '[object Number]';
  },
  isString(value) {
    return Object.prototype.toString.call(value) == '[object String]';
  },
  isArray(value) {
    return Object.prototype.toString.call(value) == '[object Array]';
  },
  isBoolean(value) {
    return Object.prototype.toString.call(value) == '[object Boolean]';
  },
  isUndefined(value) {
    return value === undefined;
  },
  isNull(value) {
    return value === null;
  },
  isSymbol(value) {
    return Object.prototype.toString.call(value) == '[object Symbol]';
  },
  isObject(value) {
    return (
      Object.prototype.toString.call(value) == '[object Object]' ||
      // if it isn't a primitive value, then it is a common object
      (!this.isNumber(value) &&
        !this.isString(value) &&
        !this.isBoolean(value) &&
        !this.isArray(value) &&
        !this.isNull(value) &&
        !this.isFunction(value) &&
        !this.isUndefined(value) &&
        !this.isSymbol(value))
    );
  },
  isFunction(value) {
    return Object.prototype.toString.call(value) == '[object Function]';
  },
  isElement(value) {
    return typeof HTMLElement === 'object'
      ? value instanceof HTMLElement // DOM2
      : value &&
          typeof value === 'object' &&
          value !== null &&
          value.nodeType === 1 &&
          typeof value.nodeName === 'string';
  },
  isWindow(value) {
    const toString = Object.prototype.toString.call(value);
    return (
      toString == '[object global]' ||
      toString == '[object Window]' ||
      toString == '[object DOMWindow]'
    );
  },

  /**
   * check whether an object is plain (using {})
   * @param object obj
   * @return boolean
   */
  isPlainObject(obj) {
    const hasOwn = Object.prototype.hasOwnProperty;
    // Must be an Object.
    if (!obj || typeof obj !== 'object' || obj.nodeType || this.isWindow(obj)) {
      return false;
    }
    try {
      if (
        obj.constructor &&
        !hasOwn.call(obj, 'constructor') &&
        !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')
      ) {
        return false;
      }
    } catch (e) {
      return false;
    }
    let key;

    return key === undefined || hasOwn.call(obj, key);
  },

  /**
   * HTML encode a string
   * @param string text
   * @return string
   */
  htmlEncode(text) {
    return document
      .createElement('a')
      .appendChild(document.createTextNode(text)).parentNode.innerHTML;
  },

  /**
   * Simple JSON stringify, stringify top level key-value
   */
  JSONStringify(stringObject) {
    if (!this.isObject(stringObject) && !this.isArray(stringObject)) {
      return JSON.stringify(stringObject);
    }

    let prefix = '{';
    let suffix = '}';
    if (this.isArray(stringObject)) {
      prefix = '[';
      suffix = ']';
    }
    let str = prefix;
    const keys = this.getObjAllKeys(stringObject);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = stringObject[key];
      try {
        // key
        if (!this.isArray(stringObject)) {
          if (this.isObject(key) || this.isArray(key) || this.isSymbol(key)) {
            str += Object.prototype.toString.call(key);
          } else {
            str += key;
          }
          str += ': ';
        }

        // value
        if (this.isArray(value)) {
          str += `Array[${value.length}]`;
        } else if (
          this.isObject(value) ||
          this.isSymbol(value) ||
          this.isFunction(value)
        ) {
          str += Object.prototype.toString.call(value);
        } else {
          str += JSON.stringify(value);
        }
        if (i < keys.length - 1) {
          str += ', ';
        }
      } catch (e) {
        continue;
      }
    }
    str += suffix;
    return str;
  },

  /**
   * get an object's all keys ignore whether they are not enumerable
   */
  getObjAllKeys(obj) {
    if (!this.isObject(obj) && !this.isArray(obj)) {
      return [];
    }
    if (this.isArray(obj)) {
      const m = [];
      obj.forEach((_, index) => {
        m.push(index);
      });
      return m;
    }
    return Object.getOwnPropertyNames(obj).sort();
  },

  /**
   * get an object's prototype name
   */
  getObjName(obj) {
    return Object.prototype.toString
      .call(obj)
      .replace('[object ', '')
      .replace(']', '');
  },

  /**
   * localStorage methods
   */
  setStorage(key, value) {
    if (!window.localStorage) {
      return;
    }
    key = `vConsole_${key}`;
    localStorage.setItem(key, value);
  }
};

/**
 * html模板
 */
const networkListHtml = `
  <div class="vc-group {{actived ? 'vc-actived' : ''}}">
    <dl class="vc-table-row vc-group-preview" data-reqid="{{id}}">
      <dd class="vc-table-col vc-table-col-4">{{url}}</dd>
      <dd class="vc-table-col">{{method}}</dd>
      <dd class="vc-table-col">{{status}}</dd>
      <dd class="vc-table-col">{{costTime}}</dd>
    </dl>
    <div class="vc-group-detail">
      {{if (header !== null)}}
      <div>
        <dl class="vc-table-row vc-left-border">
          <dt class="vc-table-col vc-table-col-title">Headers</dt>
        </dl>
        {{for (var key in header)}}
        <div class="vc-table-row vc-left-border vc-small">
          <div class="vc-table-col vc-table-col-2">{{key}}</div>
          <div class="vc-table-col vc-table-col-4 vc-max-height-line">{{header[key]}}</div>
        </div>
        {{/for}}
      </div>
      {{/if}} {{if (getData !== null)}}
      <div>
        <dl class="vc-table-row vc-left-border">
          <dt class="vc-table-col vc-table-col-title">Query String Parameters</dt>
        </dl>
        {{for (var key in getData)}}
        <div class="vc-table-row vc-left-border vc-small">
          <div class="vc-table-col vc-table-col-2">{{key}}</div>
          <div class="vc-table-col vc-table-col-4 vc-max-height-line">{{getData[key]}}</div>
        </div>
        {{/for}}
      </div>
      {{/if}} {{if (postData !== null)}}
      <div>
        <dl class="vc-table-row vc-left-border">
          <dt class="vc-table-col vc-table-col-title">Form Data</dt>
        </dl>
        {{for (var key in postData)}}
        <div class="vc-table-row vc-left-border vc-small">
          <div class="vc-table-col vc-table-col-2">{{key}}</div>
          <div class="vc-table-col vc-table-col-4 vc-max-height-line">
            {{postData[key]}}
          </div>
        </div>
        {{/for}}
      </div>
      {{/if}}
      <div>
        <dl class="vc-table-row vc-left-border">
          <dt class="vc-table-col vc-table-col-title">Response</dt>
        </dl>
        <div class="vc-table-row vc-left-border vc-small">
          {{if (!isCloseFold)}}
            <div class="vc-table-col vc-max-height vc-min-height vc-network-response"></div>
          {{ else }}
            <pre class="vc-table-col vc-max-height vc-min-height">{{response || ''}}</pre>
          {{/if}}
        </div>
      </div>
    </div>
  </div>
`;
const networkInfoBox = `
  <div id="{{_id}}" class="vc-item vc-item-{{logType}} {{style}}">
    <div class="vc-item-content"></div>
  </div>
`;
const networkInfoFold = `
  <div class="vc-fold">
    {{if (lineType == 'obj')}}
      <i class="vc-fold-outer">{{outer}}</i>
      <div class="vc-fold-inner"></div>
    {{else if (lineType == 'value')}}
      <i class="vc-code-{{valueType}}">{{value}}</i>
    {{else if (lineType == 'kv')}}
      <i class="vc-code-key{{if (keyType)}} vc-code-{{keyType}}-key{{/if}}">{{key}}</i>: <i class="vc-code-{{valueType}}">{{value}}</i>
    {{/if}}
  </div>
`;
const networkInfoFoldCode = `
  <span>
    <i class="vc-code-key{{if (keyType)}} vc-code-{{keyType}}-key{{/if}}">{{key}}</i>: <i class="vc-code-{{valueType}}">{{value}}</i>
  </span>
`;

// 是否需要关闭折叠功能
const IS_CLOSE_FOLD_KEY = 'is_close_fold';

function injectCSS(text = '') {
  const $style = document.createElement('style');
  $style.type = 'text/css';
  $style.textContent = `\n${text.trim()}\n`;
  document.head.appendChild($style);
}

function escape2Html(str) {
  const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
  return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, (all, t) => arrEntities[t]);
}

/**
 *
 * @param {string[]} filterList 被过滤的url
 * @param {string} url 被检测的url
 * @param {*} domList network选项卡中显示的dom
 * @param {*} id dom对应的id
 * @returns {boolean} 是否被过滤
 */
function isFilter(filterList, url, domList = null, id = null) {
  for (const _url of filterList) {
    // 匹配规则在这里修改
    const httpUrl = `^${_url.replace(/\./g, '\\.').replace(/\//g, '\\/')}`;
    const reg = new RegExp(
      /^https?/.test(_url)
        ? `${httpUrl}`
        : `https?:\\/\\/${_url.replace(/\./g, '\\.').replace(/\//g, '\\/')}`
    );
    if (reg.test(url)) {
      if (domList && domList[id]) {
        domList[id].parentNode.removeChild(domList[id]);
        domList[id] = undefined;
      }
      return true;
    }
  }
  return false;
}

// query
const $ = {
  /**
   * add className(s) to an or multiple element(s)
   * @public
   */
  addClass($el, className) {
    if (!$el) {
      return;
    }
    if (!tool.isArray($el)) {
      $el = [$el];
    }
    for (let i = 0; i < $el.length; i++) {
      const name = $el[i].className || '';
      const arr = name.split(' ');
      if (arr.indexOf(className) > -1) {
        continue;
      }
      arr.push(className);
      $el[i].className = arr.join(' ');
    }
  },

  /**
   * get single element
   * @public
   */
  one(selector, contextElement) {
    try {
      return (contextElement || document).querySelector(selector) || undefined;
    } catch (e) {
      return undefined;
    }
  },

  /**
   * bind an event to element(s)
   * @public
   * @param  array    $el      element object or array
   * @param  string    eventType  name of the event
   * @param  function  fn
   * @param  boolean    useCapture
   */
  bind($el, eventType, fn, useCapture) {
    if (!$el) {
      return;
    }
    if (!tool.isArray($el)) {
      $el = [$el];
    }
    $el.forEach(el => {
      el.addEventListener(eventType, fn, !!useCapture);
    });
  },

  /**
   * see whether an element contains a className
   * @public
   */
  hasClass($el, className) {
    if (!$el || !$el.classList) {
      return false;
    }
    return $el.classList.contains(className);
  },

  /**
   * remove className(s) from an or multiple element(s)
   * @public
   */
  removeClass($el, className) {
    if (!$el) {
      return;
    }
    if (!tool.isArray($el)) {
      $el = [$el];
    }
    for (let i = 0; i < $el.length; i++) {
      const arr = $el[i].className.split(' ');
      for (let j = 0; j < arr.length; j++) {
        if (arr[j] == className) {
          arr[j] = '';
        }
      }
      $el[i].className = arr.join(' ').trim();
    }
  },

  /**
   *
   * @param {string} tpl html模板
   * @param {object} data 渲染的数据
   * @param {*} toString
   * @returns
   */
  render(tpl, data, toString) {
    // eslint-disable-next-line no-useless-escape
    const pattern = /\{\{([^\}]+)\}\}/g;
    let code = '';
    let codeWrap = '';
    let pointer = 0;
    let match = [];
    const addCode = function (line, isJS) {
      if (line === '') {
        return;
      }
      if (isJS) {
        if (line.match(/^ ?else/g)) {
          // else  --> } else {
          code += `} ${line} {\n`;
        } else if (line.match(/\/(if|for|switch)/g)) {
          // /if  -->  }
          code += '}\n';
        } else if (line.match(/^ ?if|for|switch/g)) {
          // if (age)  -->  if (this.age) {
          code += `${line} {\n`;
        } else if (line.match(/^ ?(break|continue) ?$/g)) {
          // break --> break;
          code += `${line};\n`;
        } else if (line.match(/^ ?(case|default)/g)) {
          // case (1) --> case (1):
          code += `${line}:\n`;
        } else {
          // name  -->  name
          code += `arr.push(${line});\n`;
        }
      } else {
        // plain text
        code += `arr.push("${line.replace(/"/g, '\\"')}");\n`;
      }
    };
    // init global param
    window.__mito_data = data;
    window.__mito_code = '';
    window.__mito_result = '';
    // remove spaces after switch
    tpl = tpl.replace(/(\{\{ ?switch(.+?)\}\})[\r\n\t ]+\{\{/g, '$1{{');
    // line breaks
    tpl = tpl
      .replace(/^[\r\n]/, '')
      .replace(/\n/g, '\\\n')
      .replace(/\r/g, '\\\r');
    // init code
    codeWrap = '(function(){\n';
    code = 'var arr = [];\n';
    while ((match = pattern.exec(tpl))) {
      addCode(tpl.slice(pointer, match.index), false);
      addCode(match[1], true);
      pointer = match.index + match[0].length;
    }
    addCode(tpl.substr(pointer, tpl.length - pointer), false);
    code += '__mito_result = arr.join("");';
    code = `with (__mito_data) {\n${code}\n}`;
    codeWrap += code;
    codeWrap += '})();';
    // console.log("code:\n"+codeWrap);
    // run code, do NOT use `eval` or `new Function` to avoid `unsafe-eval` CSP rule
    const scriptList = document.getElementsByTagName('script');
    let nonce = '';
    if (scriptList.length > 0) {
      nonce = scriptList[0].nonce || ''; // get nonce to avoid `unsafe-inline`
    }
    const script = document.createElement('SCRIPT');
    script.innerHTML = codeWrap;
    script.setAttribute('nonce', nonce);
    document.documentElement.appendChild(script);
    let dom = window.__mito_result;
    document.documentElement.removeChild(script);
    if (!toString) {
      const e = document.createElement('DIV');
      e.innerHTML = dom;
      dom = e.children[0];
    }
    return dom;
  }
};

function getFoldedLine(obj, outer) {
  let isFirst = false;

  if (!outer) {
    const json = tool.JSONStringify(obj);
    let preview = json.substr(0, 36);
    outer = tool.getObjName(obj);
    if (json.length > 36) {
      preview += '...';
    }
    outer += ` ${preview}`;

    isFirst = true;
  }
  const $line = $.render(networkInfoFold, {
    outer,
    lineType: 'obj'
  });

  $.bind($.one('.vc-fold-outer', $line), 'click', e => {
    e.preventDefault();
    e.stopPropagation();
    if ($.hasClass($line, 'vc-toggle')) {
      $.removeClass($line, 'vc-toggle');
      $.removeClass($.one('.vc-fold-inner', $line), 'vc-toggle');
      $.removeClass($.one('.vc-fold-outer', $line), 'vc-toggle');
    } else {
      $.addClass($line, 'vc-toggle');
      $.addClass($.one('.vc-fold-inner', $line), 'vc-toggle');
      $.addClass($.one('.vc-fold-outer', $line), 'vc-toggle');
    }
    const $content = $.one('.vc-fold-inner', $line);
    setTimeout(() => {
      if ($content.children.length == 0 && !!obj) {
        // render object's keys
        const keys = tool.getObjAllKeys(obj);
        for (let i = 0; i < keys.length; i++) {
          let val;
          let valueType = 'undefined';
          let keyType = '';
          try {
            val = obj[keys[i]];
          } catch (err) {
            continue;
          }
          // handle value
          if (tool.isString(val)) {
            valueType = 'string';
            val = `"${val}"`;
          } else if (tool.isNumber(val)) {
            valueType = 'number';
          } else if (tool.isBoolean(val)) {
            valueType = 'boolean';
          } else if (tool.isNull(val)) {
            valueType = 'null';
            val = 'null';
          } else if (tool.isUndefined(val)) {
            valueType = 'undefined';
            val = 'undefined';
          } else if (tool.isFunction(val)) {
            valueType = 'function';
            val = 'function()';
          } else if (tool.isSymbol(val)) {
            valueType = 'symbol';
          }
          // render
          let $sub;
          if (tool.isArray(val)) {
            const name = `${tool.getObjName(val)}[${val.length}]`;
            $sub = getFoldedLine(
              val,
              $.render(
                networkInfoFoldCode,
                {
                  key: keys[i],
                  keyType,
                  value: name,
                  valueType: 'array'
                },
                true
              )
            );
          } else if (tool.isObject(val)) {
            const name = tool.getObjName(val);
            $sub = getFoldedLine(
              val,
              $.render(
                networkInfoFoldCode,
                {
                  key: tool.htmlEncode(keys[i]),
                  keyType,
                  value: name,
                  valueType: 'object'
                },
                true
              )
            );
          } else {
            if (
              obj.hasOwnProperty &&
              !Object.prototype.hasOwnProperty.call(obj, keys[i])
            ) {
              keyType = 'private';
            }
            const renderData = {
              lineType: 'kv',
              key: tool.htmlEncode(keys[i]),
              keyType,
              value: tool.htmlEncode(val),
              valueType
            };
            $sub = $.render(networkInfoFold, renderData);
          }
          $content.insertAdjacentElement('beforeend', $sub);
        }
        // render object's prototype
        // if (tool.isObject(obj)) {
        //   let proto = obj.__proto__,
        //     $proto;
        //   if (tool.isObject(proto)) {
        //     $proto = getFoldedLine(
        //       proto,
        //       $.render(
        //         networkInfoFoldCode,
        //         {
        //           key: "__proto__",
        //           keyType: "private",
        //           value: tool.getObjName(proto),
        //           valueType: "object"
        //         },
        //         true
        //       )
        //     );
        //   } else {
        //     // if proto is not an object, it should be `null`
        //     $proto = $.render(networkInfoFoldCode, {
        //       key: "__proto__",
        //       keyType: "private",
        //       value: "null",
        //       valueType: "null"
        //     });
        //   }
        //   $content.insertAdjacentElement("beforeend", $proto);
        // }
      }
    });
    return false;
  });

  const { result } = obj;
  if (isFirst || result) {
    $.one('.vc-fold-outer', $line).click();
  }

  return $line;
}

function printNewLog(item, logs) {
  // create line
  const $line = $.render(networkInfoBox, {
    _id: item._id,
    logType: item.logType,
    style: item.style || ''
  });

  // find %c keyword in first log only
  const patternC = /(\%c )|( \%c)/g;
  const logStyle = [];
  if (tool.isString(logs[0]) && patternC.test(logs[0])) {
    // '%c aaa %c bbb'  =>  ['aaa', 'bbb']
    const _logs = logs[0]
      .split(patternC)
      .filter(val => val !== undefined && val !== '' && !/ ?\%c ?/.test(val));
    const matchC = logs[0].match(patternC);
    // use the following string logs as style
    for (let i = 0; i < matchC.length; i++) {
      if (tool.isString(logs[i + 1])) {
        logStyle.push(logs[i + 1]);
      }
    }
    // add remain logs
    for (let i = matchC.length + 1; i < logs.length; i++) {
      _logs.push(logs[i]);
    }
    logs = _logs;
  }

  const $content = $.one('.vc-item-content', $line);
  // generate content from item.logs
  for (let i = 0; i < logs.length; i++) {
    let log;
    try {
      if (logs[i] === '') {
        // ignore empty string
        continue;
      } else if (tool.isFunction(logs[i])) {
        // convert function to string
        log = `<span> ${logs[i].toString()}</span>`;
      } else if (tool.isObject(logs[i]) || tool.isArray(logs[i])) {
        // object or array
        log = getFoldedLine(logs[i]);
      } else {
        // default
        log = `${
          (logStyle[i] ? `<span style="${logStyle[i]}"> ` : '<span> ') +
          tool.htmlEncode(logs[i]).replace(/\n/g, '<br/>')
        }</span>`;
      }
    } catch (e) {
      log = `<span> [${typeof logs[i]}]</span>`;
    }
    if (log) {
      if (typeof log === 'string')
        $content.insertAdjacentHTML('beforeend', log);
      else $content.insertAdjacentElement('beforeend', log);
    }
  }

  // generate content from item.content
  if (tool.isObject(item.content)) {
    $content.insertAdjacentElement('beforeend', item.content);
  }

  // let $tabbox = $.render("", {});
  // render to panel
  // $.one(".vc-log", $tabbox).insertAdjacentElement("beforeend", $line);

  // remove overflow logs
  // this.logNumber++;
  // this.limitMaxLogs();

  return $line;
}

class VConsoleNetworkPluginUpgrade extends VConsoleNetworkPlugin {
  constructor(...args) {
    super(...args);
    this.filterList = args[2];
    this.proxyObj = args[3];
    this.isCloseFold = localStorage.getItem(IS_CLOSE_FOLD_KEY);

    injectCSS(`
      /* 处理vc-table-col的格式 */
      #__vconsole .vc-network-response {
        white-space: normal !important;
      }

      /* 去除vc-item的下划线 */
      #__vconsole .vc-network-response .vc-item {
        border: none;
      }
    `);
  }

  updateRequest(id, data) {
    // see whether add new item into list
    const preCount = Object.keys(this.reqList).length;

    // update item
    const item = this.reqList[id] || {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        item[key] = data[key];
      }
    }
    this.reqList[id] = item;

    if (!this.isReady) {
      return;
    }

    // update dom
    const domData = {
      id,
      url: item.url,
      status: item.status,
      method: item.method || '-',
      costTime: item.costTime > 0 ? `${item.costTime}ms` : '-',
      header: item.header || null,
      getData: item.getData || null,
      postData: item.postData || null,
      response: null,
      actived: !!item.actived,
      isCloseFold: this.isCloseFold
    };
    switch (item.responseType) {
      case '':
      case 'text':
        // try to parse JSON
        if (tool.isString(item.response)) {
          try {
            domData.response = JSON.parse(item.response);
            if (this.isCloseFold) {
              domData.response = JSON.stringify(domData.response, null, 1);
              domData.response = tool.htmlEncode(domData.response);
            }
          } catch (e) {
            // not a JSON string
            domData.response = tool.htmlEncode(item.response);
          }
        } else if (typeof item.response !== 'undefined') {
          domData.response = Object.prototype.toString.call(item.response);
        }
        break;
      case 'json':
        if (typeof item.response !== 'undefined') {
          domData.response = JSON.stringify(item.response, null, 1);
          domData.response = tool.htmlEncode(domData.response);
        }
        break;
      case 'blob':
      case 'document':
      case 'arraybuffer':
      default:
        if (typeof item.response !== 'undefined') {
          domData.response = Object.prototype.toString.call(item.response);
        }
        break;
    }

    const _id = `__vc_${Math.random().toString(36).substring(2, 8)}`;

    if (item.readyState == 0 || item.readyState == 1) {
      domData.status = 'Pending';
    } else if (item.readyState == 2 || item.readyState == 3) {
      domData.status = 'Loading';
    } else if (item.readyState == 4) {
      // do nothing
    } else {
      domData.status = 'Unknown';
    }

    // networkListHtml 为html模板
    const $new = $.render(networkListHtml, domData);
    const $old = this.domList[id];
    if (item.status >= 400) {
      $.addClass($.one('.vc-group-preview', $new), 'vc-table-row-error');
    }
    if ($old) {
      $old.parentNode.replaceChild($new, $old);
    } else {
      $.one('.vc-log', this.$tabbox).insertAdjacentElement('beforeend', $new);
    }

    if (!this.isCloseFold) {
      // 处理 HTML转义符
      const responseData = tool.isString(domData.response)
        ? [escape2Html(domData.response)]
        : [domData.response];

      // 处理response显示方式 折叠
      const $responseHtml = printNewLog({ _id, logType: 'log' }, responseData);
      $.one('.vc-network-response', $new).insertAdjacentElement(
        'beforeend',
        $responseHtml
      );
    }

    // $.one(".vc-fold-outer", $responseHtml) &&
    //   $.one(".vc-fold-outer", $responseHtml).click();

    this.domList[id] = $new;

    // update header
    const curCount = Object.keys(this.reqList).length;
    if (curCount != preCount) {
      this.renderHeader();
    }

    // scroll to bottom
    if (this.isInBottom) {
      this.scrollToBottom();
    }
  }

  changeMode() {
    this.isCloseFold
      ? localStorage.removeItem(IS_CLOSE_FOLD_KEY)
      : localStorage.setItem(IS_CLOSE_FOLD_KEY, 1);
    this.isCloseFold = !this.isCloseFold;
  }

  mockAjax() {
    const _XMLHttpRequest = window.XMLHttpRequest;
    if (!_XMLHttpRequest) {
      return;
    }

    const that = this;
    const _open = window.XMLHttpRequest.prototype.open;
    const _send = window.XMLHttpRequest.prototype.send;
    that._open = _open;
    that._send = _send;

    // mock open()
    window.XMLHttpRequest.prototype.open = function () {
      const XMLReq = this;
      const args = [].slice.call(arguments);
      const method = args[0];
      const url = args[1];
      const id = that.getUniqueID();
      let timer = null;

      // may be used by other functions
      XMLReq._requestID = id;
      XMLReq._method = method;
      XMLReq._url = url;

      const domain = url.split('/')[2];

      if (Object.prototype.hasOwnProperty.call(that.proxyObj, domain)) {
        const regexp = `/${domain}/g`;
        args[1] = url.replace(eval(regexp), that.proxyObj[domain]);
        XMLReq._url = url.replace(eval(regexp), that.proxyObj[domain]);
      }
      if (isFilter(that.filterList, url)) {
        return _open.apply(XMLReq, args);
      }

      // mock onreadystatechange
      const _onreadystatechange = XMLReq.onreadystatechange || function () {};
      const onreadystatechange = function () {
        const item = that.reqList[id] || {};

        // update status
        item.readyState = XMLReq.readyState;
        item.status = 0;
        if (XMLReq.readyState > 1) {
          item.status = XMLReq.status;
        }
        item.responseType = XMLReq.responseType;

        if (XMLReq.readyState === 0) {
          // UNSENT
          if (!item.startTime) {
            item.startTime = +new Date();
          }
        } else if (XMLReq.readyState === 1) {
          // OPENED
          if (!item.startTime) {
            item.startTime = +new Date();
          }
        } else if (XMLReq.readyState === 2) {
          // HEADERS_RECEIVED
          item.header = {};
          const header = XMLReq.getAllResponseHeaders() || '';
          const headerArr = header.split('\n');
          // extract plain text to key-value format
          for (let i = 0; i < headerArr.length; i++) {
            const line = headerArr[i];
            if (!line) {
              continue;
            }
            const arr = line.split(': ');
            const key = arr[0];
            const value = arr.slice(1).join(': ');
            item.header[key] = value;
          }
        } else if (XMLReq.readyState === 3) {
          // LOADING
        } else if (XMLReq.readyState === 4) {
          // DONE
          clearInterval(timer);
          item.endTime = +new Date();
          item.costTime = item.endTime - (item.startTime || item.endTime);
          item.response = XMLReq.response;
        } else {
          clearInterval(timer);
        }

        if (!XMLReq._noVConsole) {
          that.updateRequest(id, item);
        }
        return _onreadystatechange.apply(XMLReq, arguments);
      };
      XMLReq.onreadystatechange = onreadystatechange;

      // some 3rd libraries will change XHR's default function
      // so we use a timer to avoid lost tracking of readyState
      let preState = -1;
      timer = setInterval(() => {
        if (preState !== XMLReq.readyState) {
          preState = XMLReq.readyState;
          onreadystatechange.call(XMLReq);
        }
      }, 10);

      return _open.apply(XMLReq, args);
    };

    // mock send()
    window.XMLHttpRequest.prototype.send = function () {
      const XMLReq = this;
      const args = [].slice.call(arguments);
      const data = args[0];

      const item = that.reqList[XMLReq._requestID] || {};
      item.method = XMLReq._method.toUpperCase();

      let query = XMLReq._url.split('?'); // a.php?b=c&d=?e => ['a.php', 'b=c&d=', '?e']
      item.url = query.shift(); // => ['b=c&d=', '?e']

      if (query.length > 0) {
        item.getData = {};
        query = query.join('?'); // => 'b=c&d=?e'
        query = query.split('&'); // => ['b=c', 'd=?e']
        for (let q of query) {
          q = q.split('=');
          item.getData[q[0]] = decodeURIComponent(q[1]);
        }
      }

      if (item.method === 'POST') {
        // save POST data
        if (tool.isString(data)) {
          const arr = data.split('&');
          item.postData = {};
          for (let q of arr) {
            q = q.split('=');
            item.postData[q[0]] = q[1];
          }
        } else if (tool.isPlainObject(data)) {
          item.postData = data;
        }
      }

      if (
        !XMLReq._noVConsole &&
        !isFilter(that.filterList, item.url, that.domList, XMLReq._requestID)
      ) {
        that.updateRequest(XMLReq._requestID, item);
      }

      return _send.apply(XMLReq, args);
    };
  }

  onAddTool(callback) {
    const that = this;
    const toolList = [
      {
        name: 'Clear',
        global: false,
        onClick() {
          that.clearLog();
        }
      },
      {
        name: 'ChangeMode',
        global: false,
        onClick() {
          that.changeMode();
        }
      }
    ];
    callback(toolList);
  }
}

/**
 *
 * vconsole 插件，Network 拓展
 *
 * @example
 * ```js
 * import VConsole from 'vconsole';
 * import { getFilterList } from '../un/vconsoleFilterNetwork';
 * import { getProxyObj } from '../un/vconsoleProxyPlugin';
 * import vconsoleNetwork from '../un/vconsoleNetworkPlugin';
 *
 * const vc = new VConsole();
 * vconsoleNetwork(vc, getFilterList(), getProxyObj());
 * ```
 *
 * @param {object} vc  VConsole对象
 * @param {string[]} filterList 过滤接口列表
 * @param {object} proxyObj 接口代理对象
 *
 */
const vconsoleNetwork = (vc, filterList, proxyObj) => {
  vc.removePlugin('network');
  vc.addPlugin(
    new VConsoleNetworkPluginUpgrade(
      'network',
      'Network',
      filterList.filter(item => item.disable).map(item => item.url), // 过滤接口列表
      proxyObj // 接口代理对象列表
    )
  );
};

export default vconsoleNetwork;
