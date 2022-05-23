/**
 * 开发阶段就模拟抽奖页面（以及其他类似调用金管家接口的功能），让客户和测试人员能完整体验整个的项目。
 *
 * 解决问题：
 * - 流程不同，影响到了客户的初版验收；
 * - 因为流程不通畅影响到了前端后端项目经理等的沟通成本。
 * 
 * @example
 * ```js
 * import mockPage from '@/rpf/un/mockPage';
 * mockPage({
 *   url: '',
 *   method: 'get'
 * });
 * ```
 * 
 * @typedef {{ url: string; method: import('axios').Method }} Config  https://github.com/axios/axios/blob/1163588aa288160282866057efcaef57dbbe417b/index.d.ts#L76
 *
 * @param {Config} config 抽奖请求

 */
export default function mockPage(config) {
  window.location.href = `https://mock-page.h5.h5no1.com/mock-page/?config=${encodeURIComponent(
    JSON.stringify(config)
  )}`;
}
