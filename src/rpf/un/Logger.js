import { asString } from './verify-type/string';

/** console 方法枚举 */
export const CONSOLE_METHODS = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/** 默认选项 */
const baseOptions = {
  /** 是否格式化时间 */
  formatTimeStr: true
};

/**
 * 获取当前标准时间
 *
 * @returns {string} 当前标准时间
 */
function getStandardTimeStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  const timeStr = new Date(now.getTime() + Math.abs(offset)).toISOString();
  return timeStr.slice(0, -5).replace('T', ' ');
}

/**
 * 标准化控制台打印信息
 *
 * 打印的信息会自动以日期时间、console类型和模块名称作为前缀。
 *
 * 打印信息的格式：`[${日期 时间}] [${console类型}] [${模块名称}] - ${传入信息}`
 *
 * @template
 * ```js
 * import { Logger, CONSOLE_METHODS } from 'rpf/un/Logger';
 *
 * // 一般用法，先获取 logger 实例，定义好模块名称
 * const logger = Logger.get('模块名称');
 *
 * // 根据情况使用对应的 logger 方法
 *
 * logger.trace('message'); // 仅用于调试，打印堆栈跟踪
 * // [2022-01-07 10:59:16] [trace] [模块名称]: message
 *
 * logger.debug('message'); // 仅用于调试，一些临时的 log
 * // [2022-01-07 10:59:16] [debug] [模块名称]: message
 *
 * logger.info('message');  // 用于打印类似埋点信息、接口返回等情况
 *  // [2022-01-07 10:59:16] [info] [模块名称]: message
 *
 * logger.warn('message'); // 用于打印警告信息，提醒作用
 *  // [2022-01-07 10:59:16] [warn] [模块名称]: message
 *
 * logger.error('message'); // 用于打印错误信息
 * // [2022-01-07 10:59:16] [error] [模块名称]: message
 *
 * // 为了方便只有一句log的情况，暴露了静态方法 log
 * Logger.log('模块名称2', CONSOLE_METHODS.TRACE, 'message' );
 * // [2022-01-07 10:59:16] [trace] [模块名称]: message
 * ```
 */
export class Logger {
  /**
   * 构造函数
   *
   * @param {string} moduleName 模块名称
   * @param {object} options 选填，选项
   * @param {boolean} options.formatTimeStr 是否格式化时间，默认为 true
   * @returns {Logger} Logger 实例
   */
  constructor(moduleName, options) {
    asString(moduleName, 'methodName is required and should be string');
    this.options = baseOptions;
    this.moduleName = moduleName;
    options && (this.options = { ...this.options, ...options });
  }

  /**
   * 获取 Logger 实例
   *
   * @param {string} moduleName 模块名称
   * @param {object} options 选填，选项
   * @param {boolean} options.formatTimeStr 是否格式化时间，默认为 true
   * @returns {Logger} Logger 实例
   */
  static get(moduleName, options) {
    return new Logger(moduleName, options);
  }

  /**
   * 生成打印信息前缀
   *
   * @private
   * @param {string} methodName console 方法名称 [ TRACE, DEBUG, INFO, WARN, ERROR ]
   * @param {string} moduleName 模块名称
   * @returns {string} prefix 信息前缀
   */
  createPrefix(methodName, moduleName = '') {
    const { formatTimeStr } = this.options;
    const logTime = formatTimeStr ? getStandardTimeStr() : new Date();
    return `[${logTime}] [${methodName}] [${moduleName || this.moduleName}]:`;
  }

  /**
   * log 静态方法
   *
   * @param {string} methodName console 方法名称 [ TRACE, DEBUG, INFO, WARN, ERROR ]
   * @param {string} moduleName 模块名称
   * @param {any} message 主要信息
   * @param {any[]} rest 其他信息
   */
  static log(methodName, moduleName, message, ...rest) {
    const logger = this.get(moduleName);
    logger.log(methodName, message, ...rest);
  }

  /**
   * 统一封装 console 方法
   *
   * @private
   * @param {string} methodName console 方法名称 [ TRACE, DEBUG, INFO, WARN, ERROR ]
   * @param {any} message 主要信息
   * @param {any[]} rest 其他信息
   */
  log(methodName, message, ...rest) {
    asString(methodName, 'methodName is required and should be string');
    const fn = console[methodName];
    if (fn) {
      fn.call(console, this.createPrefix(methodName), message, ...rest);
    } else {
      console.error('methodName is should be one of CONSOLE_METHODS');
    }
  }

  /**
   * 输出一个堆栈跟踪，在 vconsole 中不会显示
   *
   * @param {any} message 主要信息
   * @param {any[]} rest 其他信息
   */
  trace(message, ...rest) {
    return this.log(CONSOLE_METHODS.TRACE, message, ...rest);
  }

  /**
   * 打印一条 debug 信息，请仅用于调试
   *
   * ⚠️注意：在浏览器控制台中，需要把控制台信息等级从 Default levels 改为 All levels，才会正常输出
   *
   * @param {any} message 主要信息
   * @param {any[]} rest 选填，其他信息
   */
  debug(message, ...rest) {
    return this.log(CONSOLE_METHODS.DEBUG, message, ...rest);
  }

  /**
   * 打印一条说明信息，一般用于类似：打印埋点信息、打印接口返回信息等情况
   *
   * @param {any} message 主要信息
   * @param {any[]} rest 选填，其他信息
   */
  info(message, ...rest) {
    return this.log(CONSOLE_METHODS.INFO, message, ...rest);
  }

  /**
   * 打印一条警告信息
   *
   * @param {any} message 主要信息
   * @param {any[]} rest 选填，其他信息
   */
  warn(message, ...rest) {
    return this.log(CONSOLE_METHODS.WARN, message, ...rest);
  }

  /**
   * 打印一条错误信息
   *
   * @param {any} message 主要信息
   * @param {any[]} rest 选填，其他信息
   */
  error(message, ...rest) {
    return this.log(CONSOLE_METHODS.ERROR, message, ...rest);
  }
}
