/**
 * 将服务端 COS([腾讯云对象存储](https://cloud.tencent.com/document/product/436)) token 接口返回结果转换成 FormData
 *
 * 相关文档：https://tzxmcy.yuque.com/tzxmcy/wiki/oosg3e#VAgCo
 *
 *
 * @example
 *
 * ```js
 * import getCOSFormData from '@/rpf/un/getCOSFormData';
 * const res = await api.getCOSToken();
 *
 * const fd = getCOSFormData(res.data.result, file);
 * const { endpoint, url } = res.data.result;
 * try {
 *   await axios.post(endpoint, fd);
 *   console.log(url);
 * } catch (e) {
 *   console.error(e.message);
 * }
 * ```
 * @typedef { policy: any, signature: any, keyTime: keyTime, secretId: any, key: any, expire: any } COSToken
 * @param {COSToken} tokenRes 接口返回结果
 * @param {File} file 需要上传的文件
 */
export default function getCOSFormData(tokenRes, file) {
  const fd = new FormData();
  const { policy, signature, keyTime, secretId, key, expire } = tokenRes;
  fd.append('Expires', expire);
  fd.append('q-sign-algorithm', 'sha1');
  fd.append('q-ak', secretId);
  fd.append('q-key-time', keyTime);
  fd.append('q-signature', signature);
  fd.append('policy', policy);
  fd.append('key', key);
  fd.append('file', file);
  return fd;
}
