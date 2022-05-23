/**
 * `wx.getLocalImgData` 的代替品，修复了在安卓设备上 base64 URL 不正确的问题
 *
 * @example
 * ```js
 * import wxGetLocalImgData from '@/rpf/un/wxGetLocalImgData';
 *
 * wxGetLocalImgData({ localId: 'x' }).then(res => {
 *   console.log(res.localData);
 * });
 * ```
 *
 * @param {object} params
 * @param {string} params.localId 从微信图像接口获取的 localId
 * @returns { Promise<{ localData: string; }> } 图片的 base64 URL
 */
export default function wxGetLocalImgData({ localId }) {
  if (!localId) {
    throw Error('wxGetLocalImgData: localId is required');
  }
  return new Promise(resolve => {
    window.wx.getLocalImgData({
      localId,
      success(res) {
        if (!/^data:image/.test(res.localData)) {
          res.localData = `data:image/jgp;base64,${res.localData}`; // IT IS `jgp`, BUT WORKS
        }

        resolve(res);
      }
    });
  });
}
